import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";
import { WstrTreasury } from "../target/types/wstr_treasury";

describe("wstr-treasury", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.WstrTreasury as Program<WstrTreasury>;
  const treasuryPda = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    program.programId
  )[0];

  /**
   * Test: Initialize the treasury
   */
  it("initializes treasury successfully", async () => {
    const bump = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury")],
      program.programId
    )[1];

    const tx = await program.methods
      .initializeTreasury(bump)
      .accounts({
        treasury: treasuryPda,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Initialize treasury transaction:", tx);

    const treasuryAccount = await program.account.treasury.fetch(treasuryPda);
    expect(treasuryAccount.authority).to.equal(provider.wallet.publicKey);
    expect(treasuryAccount.totalResourcesCount.toNumber()).to.equal(0);
    expect(treasuryAccount.totalUsdValue.toNumber()).to.equal(0);
    expect(treasuryAccount.totalFeesReceived.toNumber()).to.equal(0);
  });

  /**
   * Test: Receive fees
   */
  it("receives fees from Pump.fun", async () => {
    const feeAmount = new anchor.BN(1000000); // 1 USDC in lamports

    const tx = await program.methods
      .receiveFees(feeAmount)
      .accounts({
        treasury: treasuryPda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Receive fees transaction:", tx);

    const treasuryAccount = await program.account.treasury.fetch(treasuryPda);
    expect(treasuryAccount.totalFeesReceived.toNumber()).to.equal(
      feeAmount.toNumber()
    );
  });

  /**
   * Test: Record resource purchase
   */
  it("records a resource purchase", async () => {
    const resourceType = "gold";
    const quantity = new anchor.BN(100); // 100 oz
    const unitPrice = new anchor.BN(2000); // $2000 per oz
    const totalCostUsd = new anchor.BN(200000); // $200,000

    const holdingPda = PublicKey.findProgramAddressSync(
      [Buffer.from("holding"), Buffer.from(resourceType)],
      program.programId
    )[0];

    const bump = PublicKey.findProgramAddressSync(
      [Buffer.from("holding"), Buffer.from(resourceType)],
      program.programId
    )[1];

    const tx = await program.methods
      .recordPurchase(resourceType, quantity, unitPrice, totalCostUsd)
      .accounts({
        treasury: treasuryPda,
        holding: holdingPda,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Record purchase transaction:", tx);

    const holdingAccount = await program.account.resourceHolding.fetch(
      holdingPda
    );
    expect(holdingAccount.resourceType).to.equal(resourceType);
    expect(holdingAccount.quantity.toNumber()).to.equal(quantity.toNumber());
    expect(holdingAccount.averagePrice.toNumber()).to.equal(
      unitPrice.toNumber()
    );
  });

  /**
   * Test: Update balance sheet with market price
   */
  it("updates balance sheet with current market price", async () => {
    const resourceType = "gold";
    const currentMarketPrice = new anchor.BN(2100); // $2100 per oz

    const holdingPda = PublicKey.findProgramAddressSync(
      [Buffer.from("holding"), Buffer.from(resourceType)],
      program.programId
    )[0];

    const tx = await program.methods
      .updateBalanceSheet(currentMarketPrice)
      .accounts({
        holding: holdingPda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Update balance sheet transaction:", tx);

    const holdingAccount = await program.account.resourceHolding.fetch(
      holdingPda
    );
    expect(holdingAccount.currentMarketPrice.toNumber()).to.equal(
      currentMarketPrice.toNumber()
    );
    // Quantity is 100 oz, price increased from 2000 to 2100
    // Current value should be 100 * 2100 = 210000
    expect(holdingAccount.currentValue.toNumber()).to.equal(210000);
    // PnL should be 210000 - 200000 = 10000
    expect(holdingAccount.pnl.toNumber()).to.equal(10000);
  });

  /**
   * Test: Record multiple purchases for same resource
   */
  it("records multiple purchases for the same resource", async () => {
    const resourceType = "oil";
    const quantity1 = new anchor.BN(500); // 500 barrels
    const unitPrice1 = new anchor.BN(80); // $80 per barrel
    const totalCost1 = new anchor.BN(40000);

    const holdingPda = PublicKey.findProgramAddressSync(
      [Buffer.from("holding"), Buffer.from(resourceType)],
      program.programId
    )[0];

    // First purchase
    await program.methods
      .recordPurchase(resourceType, quantity1, unitPrice1, totalCost1)
      .accounts({
        treasury: treasuryPda,
        holding: holdingPda,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Second purchase
    const quantity2 = new anchor.BN(300);
    const unitPrice2 = new anchor.BN(90);
    const totalCost2 = new anchor.BN(27000);

    await program.methods
      .recordPurchase(resourceType, quantity2, unitPrice2, totalCost2)
      .accounts({
        treasury: treasuryPda,
        holding: holdingPda,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const holdingAccount = await program.account.resourceHolding.fetch(
      holdingPda
    );
    // Total quantity: 500 + 300 = 800
    expect(holdingAccount.quantity.toNumber()).to.equal(800);
    // Total cost: 40000 + 27000 = 67000
    expect(holdingAccount.totalCostBasis.toNumber()).to.equal(67000);
    // Average price: 67000 / 800 = 83.75
    expect(holdingAccount.averagePrice.toNumber()).to.equal(83);
  });

  /**
   * Test: Update balance sheet for multiple resources
   */
  it("updates balance sheets for multiple resources independently", async () => {
    const goldPda = PublicKey.findProgramAddressSync(
      [Buffer.from("holding"), Buffer.from("gold")],
      program.programId
    )[0];

    const oilPda = PublicKey.findProgramAddressSync(
      [Buffer.from("holding"), Buffer.from("oil")],
      program.programId
    )[0];

    const goldNewPrice = new anchor.BN(2500);
    const oilNewPrice = new anchor.BN(95);

    await program.methods
      .updateBalanceSheet(goldNewPrice)
      .accounts({
        holding: goldPda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    await program.methods
      .updateBalanceSheet(oilNewPrice)
      .accounts({
        holding: oilPda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const goldHolding = await program.account.resourceHolding.fetch(goldPda);
    const oilHolding = await program.account.resourceHolding.fetch(oilPda);

    expect(goldHolding.currentMarketPrice.toNumber()).to.equal(
      goldNewPrice.toNumber()
    );
    expect(oilHolding.currentMarketPrice.toNumber()).to.equal(
      oilNewPrice.toNumber()
    );
  });

  /**
   * Test: Events are emitted correctly
   */
  it("emits events on state changes", async () => {
    let eventEmitted = false;

    const listener = program.addEventListener("PurchaseRecorded", (_event) => {
      eventEmitted = true;
    });

    const resourceType = "copper";
    const quantity = new anchor.BN(1000);
    const unitPrice = new anchor.BN(10);
    const totalCostUsd = new anchor.BN(10000);

    const holdingPda = PublicKey.findProgramAddressSync(
      [Buffer.from("holding"), Buffer.from(resourceType)],
      program.programId
    )[0];

    await program.methods
      .recordPurchase(resourceType, quantity, unitPrice, totalCostUsd)
      .accounts({
        treasury: treasuryPda,
        holding: holdingPda,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Wait a bit for event propagation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(eventEmitted).to.be.true;

    program.removeEventListener(listener);
  });
});
