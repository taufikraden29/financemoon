import { supabase } from '@/lib/supabase'

/**
 * Recurring Transaction Service - Supabase operations for recurring transactions
 */

export const recurringService = {
    // Get all recurring transactions
    async getAll() {
        const { data, error } = await supabase
            .from('recurring_transactions')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data.map(transformFromDB)
    },

    // Add new recurring transaction
    async add(recurringData) {
        const { data, error } = await supabase
            .from('recurring_transactions')
            .insert({
                name: recurringData.name,
                type: recurringData.type,
                amount: parseFloat(recurringData.amount),
                category: recurringData.category,
                account_id: recurringData.accountId || null,
                recurrence: recurringData.recurrence,
                start_date: recurringData.startDate,
                end_date: recurringData.endDate || null,
                next_occurrence: recurringData.startDate,
                is_active: true
            })
            .select()
            .single()

        if (error) throw error
        return transformFromDB(data)
    },

    // Update recurring transaction
    async update(id, updates) {
        const dbUpdates = {}
        if (updates.name !== undefined) dbUpdates.name = updates.name
        if (updates.type !== undefined) dbUpdates.type = updates.type
        if (updates.amount !== undefined) dbUpdates.amount = parseFloat(updates.amount)
        if (updates.category !== undefined) dbUpdates.category = updates.category
        if (updates.accountId !== undefined) dbUpdates.account_id = updates.accountId
        if (updates.recurrence !== undefined) dbUpdates.recurrence = updates.recurrence
        if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate
        if (updates.nextOccurrence !== undefined) dbUpdates.next_occurrence = updates.nextOccurrence
        if (updates.lastGenerated !== undefined) dbUpdates.last_generated = updates.lastGenerated
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive

        const { data, error } = await supabase
            .from('recurring_transactions')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return transformFromDB(data)
    },

    // Delete recurring transaction
    async delete(id) {
        const { error } = await supabase
            .from('recurring_transactions')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    },

    // Toggle active status
    async toggleActive(id) {
        const { data: current } = await supabase
            .from('recurring_transactions')
            .select('is_active')
            .eq('id', id)
            .single()

        const { data, error } = await supabase
            .from('recurring_transactions')
            .update({ is_active: !current.is_active })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return transformFromDB(data)
    },

    // Get upcoming recurring transactions
    async getUpcoming(days = 30) {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + days)

        const { data, error } = await supabase
            .from('recurring_transactions')
            .select('*')
            .eq('is_active', true)
            .lte('next_occurrence', futureDate.toISOString().split('T')[0])
            .order('next_occurrence', { ascending: true })

        if (error) throw error
        return data.map(transformFromDB)
    }
}

// Transform DB snake_case to camelCase
function transformFromDB(row) {
    if (!row) return null
    return {
        id: row.id,
        name: row.name,
        type: row.type,
        amount: parseFloat(row.amount),
        category: row.category,
        accountId: row.account_id,
        recurrence: row.recurrence,
        startDate: row.start_date,
        endDate: row.end_date,
        nextOccurrence: row.next_occurrence,
        lastGenerated: row.last_generated,
        isActive: row.is_active,
        createdAt: row.created_at
    }
}
