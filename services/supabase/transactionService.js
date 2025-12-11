import { supabase } from '@/lib/supabase'

/**
 * Transaction Service - Supabase operations for transactions
 */

export const transactionService = {
    // Get all transactions
    async getAll() {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false })

        if (error) throw error
        return data.map(transformFromDB)
    },

    // Add new transaction
    async add(transactionData) {
        const { data, error } = await supabase
            .from('transactions')
            .insert(transformToDB(transactionData))
            .select()
            .single()

        if (error) throw error
        return transformFromDB(data)
    },

    // Update transaction
    async update(id, updates) {
        const { data, error } = await supabase
            .from('transactions')
            .update(transformToDB(updates))
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return transformFromDB(data)
    },

    // Delete transaction
    async delete(id) {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    },

    // Get transactions by date range
    async getByDateRange(startDate, endDate) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false })

        if (error) throw error
        return data.map(transformFromDB)
    },

    // Get transactions by category
    async getByCategory(category) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('category', category)
            .order('date', { ascending: false })

        if (error) throw error
        return data.map(transformFromDB)
    }
}

// Transform DB snake_case to camelCase
function transformFromDB(row) {
    if (!row) return null
    return {
        id: row.id,
        type: row.type,
        amount: parseFloat(row.amount),
        description: row.description,
        category: row.category,
        accountId: row.account_id,
        date: row.date,
        recurringId: row.recurring_id,
        isFromRecurring: row.is_from_recurring,
        createdAt: row.created_at
    }
}

// Transform camelCase to DB snake_case
function transformToDB(data) {
    const result = {}
    if (data.type !== undefined) result.type = data.type
    if (data.amount !== undefined) result.amount = parseFloat(data.amount)
    if (data.description !== undefined) result.description = data.description
    if (data.category !== undefined) result.category = data.category
    if (data.accountId !== undefined) result.account_id = data.accountId
    if (data.date !== undefined) result.date = data.date
    if (data.recurringId !== undefined) result.recurring_id = data.recurringId
    if (data.isFromRecurring !== undefined) result.is_from_recurring = data.isFromRecurring
    return result
}
