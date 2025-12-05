import { supabase } from '../../lib/supabase'

/**
 * Account Service - Supabase operations for accounts
 */

export const accountService = {
    // Get all accounts
    async getAll() {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .order('created_at', { ascending: true })

        if (error) throw error
        return data.map(transformFromDB)
    },

    // Add new account
    async add(accountData) {
        const { data, error } = await supabase
            .from('accounts')
            .insert(transformToDB(accountData))
            .select()
            .single()

        if (error) throw error
        return transformFromDB(data)
    },

    // Update account
    async update(id, updates) {
        const { data, error } = await supabase
            .from('accounts')
            .update(transformToDB(updates))
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return transformFromDB(data)
    },

    // Delete account
    async delete(id) {
        const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    },

    // Update balance
    async updateBalance(id, amount, operation = 'add') {
        // First get current balance
        const { data: current, error: fetchError } = await supabase
            .from('accounts')
            .select('balance')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError

        const newBalance = operation === 'add'
            ? current.balance + amount
            : current.balance - amount

        const { data, error } = await supabase
            .from('accounts')
            .update({ balance: newBalance })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return transformFromDB(data)
    },

    // Transfer between accounts
    async transfer(fromId, toId, amount) {
        // Use transaction-like approach
        await this.updateBalance(fromId, amount, 'subtract')
        await this.updateBalance(toId, amount, 'add')
        return true
    }
}

// Transform DB snake_case to camelCase
function transformFromDB(row) {
    if (!row) return null
    return {
        id: row.id,
        name: row.name,
        type: row.type,
        balance: parseFloat(row.balance),
        icon: row.icon,
        color: row.color,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }
}

// Transform camelCase to DB snake_case
function transformToDB(data) {
    const result = {}
    if (data.name !== undefined) result.name = data.name
    if (data.type !== undefined) result.type = data.type
    if (data.balance !== undefined) result.balance = parseFloat(data.balance)
    if (data.icon !== undefined) result.icon = data.icon
    if (data.color !== undefined) result.color = data.color
    if (data.isActive !== undefined) result.is_active = data.isActive
    return result
}
