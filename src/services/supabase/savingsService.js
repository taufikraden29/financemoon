import { supabase } from '../../lib/supabase'

/**
 * Savings Service - Supabase operations for savings and contributions
 */

export const savingsService = {
    // Get all savings with contributions
    async getAll() {
        const { data: savings, error: savingsError } = await supabase
            .from('savings')
            .select('*')
            .order('created_at', { ascending: false })

        if (savingsError) throw savingsError

        // Get all contributions
        const { data: contributions, error: contribError } = await supabase
            .from('savings_contributions')
            .select('*')
            .order('date', { ascending: false })

        if (contribError) throw contribError

        // Combine savings with their contributions
        return savings.map(saving => ({
            ...transformSavingsFromDB(saving),
            contributions: contributions
                .filter(c => c.savings_id === saving.id)
                .map(transformContributionFromDB)
        }))
    },

    // Add new savings goal
    async add(savingsData) {
        const initialContribution = parseFloat(savingsData.initialContribution) || 0

        // Insert savings
        const { data: saving, error: savingError } = await supabase
            .from('savings')
            .insert({
                name: savingsData.name,
                target_amount: parseFloat(savingsData.targetAmount),
                current_amount: initialContribution,
                target_date: savingsData.targetDate || null,
                status: 'active'
            })
            .select()
            .single()

        if (savingError) throw savingError

        let contributions = []

        // Add initial contribution if provided
        if (initialContribution > 0) {
            const { data: contrib, error: contribError } = await supabase
                .from('savings_contributions')
                .insert({
                    savings_id: saving.id,
                    amount: initialContribution,
                    note: 'Initial contribution'
                })
                .select()
                .single()

            if (contribError) throw contribError
            contributions = [transformContributionFromDB(contrib)]
        }

        return {
            ...transformSavingsFromDB(saving),
            contributions
        }
    },

    // Add contribution to savings
    async addContribution(savingsId, amount, note = '') {
        // Get current amount
        const { data: saving, error: fetchError } = await supabase
            .from('savings')
            .select('current_amount, target_amount')
            .eq('id', savingsId)
            .single()

        if (fetchError) throw fetchError

        const newAmount = saving.current_amount + parseFloat(amount)
        const status = newAmount >= saving.target_amount ? 'completed' : 'active'

        // Update savings amount
        await supabase
            .from('savings')
            .update({ current_amount: newAmount, status })
            .eq('id', savingsId)

        // Add contribution record
        const { data: contrib, error: contribError } = await supabase
            .from('savings_contributions')
            .insert({
                savings_id: savingsId,
                amount: parseFloat(amount),
                note
            })
            .select()
            .single()

        if (contribError) throw contribError

        return transformContributionFromDB(contrib)
    },

    // Update savings
    async update(id, updates) {
        const dbUpdates = {}
        if (updates.name !== undefined) dbUpdates.name = updates.name
        if (updates.targetAmount !== undefined) dbUpdates.target_amount = parseFloat(updates.targetAmount)
        if (updates.targetDate !== undefined) dbUpdates.target_date = updates.targetDate
        if (updates.status !== undefined) dbUpdates.status = updates.status

        const { data, error } = await supabase
            .from('savings')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return transformSavingsFromDB(data)
    },

    // Delete savings (cascade deletes contributions)
    async delete(id) {
        const { error } = await supabase
            .from('savings')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }
}

// Transform savings from DB
function transformSavingsFromDB(row) {
    if (!row) return null
    return {
        id: row.id,
        name: row.name,
        targetAmount: parseFloat(row.target_amount),
        currentAmount: parseFloat(row.current_amount),
        targetDate: row.target_date,
        status: row.status,
        createdDate: row.created_at,
        updatedAt: row.updated_at
    }
}

// Transform contribution from DB
function transformContributionFromDB(row) {
    if (!row) return null
    return {
        id: row.id,
        savingsId: row.savings_id,
        amount: parseFloat(row.amount),
        note: row.note,
        date: row.date
    }
}
