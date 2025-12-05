import { supabase } from '../../lib/supabase'

/**
 * Budget Service - Supabase operations for budgets
 */

export const budgetService = {
    // Get all budgets
    async getAll() {
        const { data, error } = await supabase
            .from('budgets')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data.map(transformFromDB)
    },

    // Get budgets by month
    async getByMonth(month) {
        const { data, error } = await supabase
            .from('budgets')
            .select('*')
            .eq('month', month)

        if (error) throw error
        return data.map(transformFromDB)
    },

    // Add new budget
    async add(budgetData) {
        const { data, error } = await supabase
            .from('budgets')
            .insert(transformToDB(budgetData))
            .select()
            .single()

        if (error) throw error
        return transformFromDB(data)
    },

    // Update budget
    async update(id, updates) {
        const { data, error } = await supabase
            .from('budgets')
            .update(transformToDB(updates))
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return transformFromDB(data)
    },

    // Delete budget
    async delete(id) {
        const { error } = await supabase
            .from('budgets')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    },

    // Update spent amount
    async updateSpent(category, month, amount) {
        // Get current budget
        const { data: current, error: fetchError } = await supabase
            .from('budgets')
            .select('*')
            .eq('category', category)
            .eq('month', month)
            .single()

        if (fetchError) {
            if (fetchError.code === 'PGRST116') return null // Not found
            throw fetchError
        }

        const newSpent = current.spent + amount
        const percentage = (newSpent / current.budget_limit) * 100

        let status = 'safe'
        if (newSpent >= current.budget_limit) status = 'exceeded'
        else if (percentage >= current.alert_threshold) status = 'warning'

        const { data, error } = await supabase
            .from('budgets')
            .update({ spent: newSpent, status })
            .eq('id', current.id)
            .select()
            .single()

        if (error) throw error
        return transformFromDB(data)
    }
}

// Transform DB snake_case to camelCase
function transformFromDB(row) {
    if (!row) return null
    return {
        id: row.id,
        category: row.category,
        limit: parseFloat(row.budget_limit),
        spent: parseFloat(row.spent),
        month: row.month,
        alertThreshold: row.alert_threshold,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }
}

// Transform camelCase to DB snake_case
function transformToDB(data) {
    const result = {}
    if (data.category !== undefined) result.category = data.category
    if (data.limit !== undefined) result.budget_limit = parseFloat(data.limit)
    if (data.spent !== undefined) result.spent = parseFloat(data.spent)
    if (data.month !== undefined) result.month = data.month
    if (data.alertThreshold !== undefined) result.alert_threshold = data.alertThreshold
    if (data.status !== undefined) result.status = data.status
    return result
}
