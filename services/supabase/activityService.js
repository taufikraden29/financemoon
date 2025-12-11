import { supabase } from '@/lib/supabase'

/**
 * Activity Service - Supabase operations for activity logging
 */

export const activityService = {
    // Get all activities
    async getAll() {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .order('timestamp', { ascending: false })

        if (error) throw error
        return data.map(transformFromDB)
    },

    // Get filtered activities
    async getFiltered(type) {
        if (type === 'all') return this.getAll()

        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('type', type)
            .order('timestamp', { ascending: false })

        if (error) throw error
        return data.map(transformFromDB)
    },

    // Log new activity
    async log(type, action, amount = null, details = {}) {
        const { data, error } = await supabase
            .from('activities')
            .insert({
                type,
                action,
                amount: amount ? parseFloat(amount) : null,
                details
            })
            .select()
            .single()

        if (error) throw error
        return transformFromDB(data)
    },

    // Search activities
    async search(query) {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .or(`action.ilike.%${query}%,details.cs.{"${query}"}`)
            .order('timestamp', { ascending: false })

        if (error) throw error
        return data.map(transformFromDB)
    },

    // Clear all activities
    async clearAll() {
        const { error } = await supabase
            .from('activities')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

        if (error) throw error
        return true
    }
}

// Transform DB to camelCase
function transformFromDB(row) {
    if (!row) return null
    return {
        id: row.id,
        type: row.type,
        action: row.action,
        amount: row.amount ? parseFloat(row.amount) : null,
        details: row.details || {},
        timestamp: row.timestamp
    }
}
