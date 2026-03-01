use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("WSTRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod wstr_treasury {
    use super::*;

    /// Initialize the treasury PDA with initial configuration
    /// 
    /// # Arguments
    /// * `ctx` - The accounts context containing treasury PDA and authority
    /// 
    /// # Returns
    /// Result indicating success or error
    pub fn initialize_treasury(
        ctx: Context<InitializeTreasury>,
        bump: u8,
    ) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.authority = ctx.accounts.authority.key();
        treasury.bump = bump;
        treasury.total_resources_count = 0;
        treasury.total_usd_value = 0;
        treasury.total_fees_received = 0;

        emit!(TreasuryInitialized {
            authority: treasury.authority,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Receive creator fees from Pump.fun
    /// 
    /// # Arguments
    /// * `ctx` - The accounts context containing treasury token account
    /// * `amount` - The amount of USDC fees received in lamports
    /// 
    /// # Returns
    /// Result indicating success or error
    pub fn receive_fees(
        ctx: Context<ReceiveFees>,
        amount: u64,
    ) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.total_fees_received = treasury.total_fees_received.checked_add(amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;

        emit!(FeesReceived {
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Record a resource purchase on the balance sheet
    /// 
    /// # Arguments
    /// * `ctx` - The accounts context
    /// * `resource` - Resource type (gold, oil, etc.)
    /// * `quantity` - Quantity purchased
    /// * `unit_price` - Price per unit in USD cents
    /// * `total_cost_usd` - Total cost in USD
    /// 
    /// # Returns
    /// Result indicating success or error
    pub fn record_purchase(
        ctx: Context<RecordPurchase>,
        resource: String,
        quantity: u64,
        unit_price: u64,
        total_cost_usd: u64,
    ) -> Result<()> {
        require!(
            resource.len() <= 32,
            CustomError::ResourceNameTooLong
        );
        require!(quantity > 0, CustomError::InvalidQuantity);
        require!(unit_price > 0, CustomError::InvalidPrice);

        let treasury = &mut ctx.accounts.treasury;
        let holding = &mut ctx.accounts.holding;

        holding.resource_type = resource.clone();
        holding.quantity = holding.quantity.checked_add(quantity)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        holding.total_cost_basis = holding.total_cost_basis.checked_add(total_cost_usd)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        holding.average_price = if holding.quantity > 0 {
            holding.total_cost_basis / holding.quantity
        } else {
            0
        };
        holding.last_purchase_timestamp = Clock::get()?.unix_timestamp;

        treasury.total_usd_value = treasury.total_usd_value.checked_add(total_cost_usd)
            .ok_or(ProgramError::ArithmeticOverflow)?;

        if holding.quantity == quantity {
            treasury.total_resources_count = treasury.total_resources_count.checked_add(1)
                .ok_or(ProgramError::ArithmeticOverflow)?;
        }

        emit!(PurchaseRecorded {
            resource,
            quantity,
            unit_price,
            total_cost_usd,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Update the balance sheet with current market prices
    /// 
    /// # Arguments
    /// * `ctx` - The accounts context
    /// * `current_market_price` - Current price per unit in USD cents
    /// 
    /// # Returns
    /// Result indicating success or error
    pub fn update_balance_sheet(
        ctx: Context<UpdateBalanceSheet>,
        current_market_price: u64,
    ) -> Result<()> {
        let holding = &mut ctx.accounts.holding;
        let previous_value = (holding.quantity as u128)
            .checked_mul(holding.average_price as u128)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        let current_value = (holding.quantity as u128)
            .checked_mul(current_market_price as u128)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        let pnl = current_value as i128 - previous_value as i128;

        holding.current_market_price = current_market_price;
        holding.current_value = current_value as u64;
        holding.pnl = pnl;
        holding.last_updated = Clock::get()?.unix_timestamp;

        emit!(BalanceSheetUpdated {
            resource: holding.resource_type.clone(),
            current_market_price,
            current_value: holding.current_value,
            pnl,
            timestamp: holding.last_updated,
        });

        Ok(())
    }
}

// ============================================================================
// ACCOUNTS
// ============================================================================

/// Treasury PDA account storing global state
#[account]
pub struct Treasury {
    /// Authority that can manage the treasury
    pub authority: Pubkey,
    /// Bump seed for PDA derivation
    pub bump: u8,
    /// Total number of unique resources held
    pub total_resources_count: u32,
    /// Total USD value of all holdings
    pub total_usd_value: u64,
    /// Total fees received from Pump.fun
    pub total_fees_received: u64,
}

/// Resource holding account tracking individual purchases
#[account]
pub struct ResourceHolding {
    /// Type of resource (gold, oil, etc.)
    pub resource_type: String,
    /// Total quantity held
    pub quantity: u64,
    /// Total cost basis in USD
    pub total_cost_basis: u64,
    /// Average price per unit
    pub average_price: u64,
    /// Current market price per unit
    pub current_market_price: u64,
    /// Current total value in USD
    pub current_value: u64,
    /// Profit/loss in USD (or SATs)
    pub pnl: i128,
    /// Last purchase timestamp
    pub last_purchase_timestamp: i64,
    /// Last update timestamp
    pub last_updated: i64,
}

// ============================================================================
// CONTEXTS
// ============================================================================

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<Treasury>(),
        seeds = [b"treasury"],
        bump
    )]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReceiveFees<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct RecordPurchase<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 16 + 8 + 8,
        seeds = [b"holding", holding.resource_type.as_bytes()],
        bump
    )]
    pub holding: Account<'info, ResourceHolding>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateBalanceSheet<'info> {
    #[account(mut)]
    pub holding: Account<'info, ResourceHolding>,
    pub authority: Signer<'info>,
}

// ============================================================================
// EVENTS
// ============================================================================

/// Emitted when treasury is initialized
#[event]
pub struct TreasuryInitialized {
    pub authority: Pubkey,
    pub timestamp: i64,
}

/// Emitted when fees are received from Pump.fun
#[event]
pub struct FeesReceived {
    pub amount: u64,
    pub timestamp: i64,
}

/// Emitted when a resource purchase is recorded
#[event]
pub struct PurchaseRecorded {
    pub resource: String,
    pub quantity: u64,
    pub unit_price: u64,
    pub total_cost_usd: u64,
    pub timestamp: i64,
}

/// Emitted when balance sheet is updated with market prices
#[event]
pub struct BalanceSheetUpdated {
    pub resource: String,
    pub current_market_price: u64,
    pub current_value: u64,
    pub pnl: i128,
    pub timestamp: i64,
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum CustomError {
    #[msg("Resource name must be 32 characters or less")]
    ResourceNameTooLong,
    #[msg("Quantity must be greater than 0")]
    InvalidQuantity,
    #[msg("Price must be greater than 0")]
    InvalidPrice,
}
