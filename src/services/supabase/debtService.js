import { supabase } from '../../lib/supabase'

/**
 * Debt Service - Supabase operations for debts and payments
 */

export const debtService = {
    // Get all debts with payments
    async getAll() {
        const { data: debts, error: debtsError } = await supabase
            .from('debts')
            .select('*')
            .order('created_at', { ascending: false })

        if (debtsError) throw debtsError

        // Get all payments
        const { data: payments, error: paymentsError } = await supabase
            .from('debt_payments')
            .select('*')
            .order('installment_number', { ascending: true })

        if (paymentsError) throw paymentsError

        // Combine debts with their payments and find next due date
        return debts.map(debt => {
            const debtPayments = payments
                .filter(p => p.debt_id === debt.id)
                .map(transformPaymentFromDB)

            // Find next unpaid payment for reminder
            const nextUnpaidPayment = debtPayments.find(p => !p.paid)

            return {
                ...transformDebtFromDB(debt),
                payments: debtPayments,
                dueDate: nextUnpaidPayment?.dueDate || null, // For reminder service
                isPaid: !nextUnpaidPayment // All payments done
            }
        })
    },

    // Add new debt with payment schedule
    async add(debtData) {
        // Insert debt with due date and reminder settings
        const { data: debt, error: debtError } = await supabase
            .from('debts')
            .insert({
                name: debtData.name,
                total_amount: parseFloat(debtData.totalAmount),
                installments: parseInt(debtData.installments),
                per_installment: parseFloat(debtData.totalAmount) / parseInt(debtData.installments),
                status: 'active'
            })
            .select()
            .single()

        if (debtError) throw debtError

        // Generate payment schedule starting from firstDueDate
        const payments = []
        const perInstallment = parseFloat(debtData.totalAmount) / parseInt(debtData.installments)
        const startDate = debtData.firstDueDate ? new Date(debtData.firstDueDate) : new Date()

        for (let i = 0; i < parseInt(debtData.installments); i++) {
            const dueDate = new Date(startDate)
            dueDate.setMonth(dueDate.getMonth() + i) // First payment on start date, then monthly

            payments.push({
                debt_id: debt.id,
                installment_number: i + 1,
                amount: perInstallment,
                due_date: dueDate.toISOString().split('T')[0],
                paid: false
            })
        }

        // Insert payments
        const { error: paymentsError } = await supabase
            .from('debt_payments')
            .insert(payments)

        if (paymentsError) throw paymentsError

        // Return complete debt with payments and dueDate for reminders
        return {
            ...transformDebtFromDB(debt),
            dueDate: payments[0]?.due_date, // First unpaid payment due date
            reminderDays: debtData.reminderDays || 3,
            payments: payments.map((p, idx) => ({
                id: null, // Will be set by DB
                debtId: debt.id,
                installmentNumber: idx + 1,
                amount: p.amount,
                dueDate: p.due_date,
                paid: false,
                paidDate: null
            }))
        }
    },

    // Mark payment as paid
    async markPayment(debtId, installmentNumber) {
        const { data, error } = await supabase
            .from('debt_payments')
            .update({ paid: true, paid_date: new Date().toISOString() })
            .eq('debt_id', debtId)
            .eq('installment_number', installmentNumber)
            .select()
            .single()

        if (error) throw error

        // Check if all payments are complete
        const { data: payments } = await supabase
            .from('debt_payments')
            .select('paid')
            .eq('debt_id', debtId)

        const allPaid = payments?.every(p => p.paid)

        if (allPaid) {
            await supabase
                .from('debts')
                .update({ status: 'completed' })
                .eq('id', debtId)
        }

        return transformPaymentFromDB(data)
    },

    // Unmark payment
    async unmarkPayment(debtId, installmentNumber) {
        const { data, error } = await supabase
            .from('debt_payments')
            .update({ paid: false, paid_date: null })
            .eq('debt_id', debtId)
            .eq('installment_number', installmentNumber)
            .select()
            .single()

        if (error) throw error

        // Set debt back to active
        await supabase
            .from('debts')
            .update({ status: 'active' })
            .eq('id', debtId)

        return transformPaymentFromDB(data)
    },

    // Update debt
    async update(id, updateData) {
        const updates = {}
        if (updateData.name) updates.name = updateData.name
        if (updateData.totalAmount) {
            updates.total_amount = updateData.totalAmount
            // Recalculate per installment if total amount changed
            const { data: currentDebt } = await supabase
                .from('debts')
                .select('installments')
                .eq('id', id)
                .single()

            if (currentDebt) {
                updates.per_installment = updateData.totalAmount / currentDebt.installments
            }
        }

        const { data, error } = await supabase
            .from('debts')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return transformDebtFromDB(data)
    },

    // Update payment due date
    async updatePaymentDueDate(debtId, installmentNumber, newDueDate) {
        const { data, error } = await supabase
            .from('debt_payments')
            .update({ due_date: newDueDate })
            .eq('debt_id', debtId)
            .eq('installment_number', installmentNumber)
            .select()
            .single()

        if (error) throw error
        return transformPaymentFromDB(data)
    },

    // Delete debt (cascade deletes payments)
    async delete(id) {
        const { error } = await supabase
            .from('debts')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }
}

// Transform debt from DB
function transformDebtFromDB(row) {
    if (!row) return null
    return {
        id: row.id,
        name: row.name,
        totalAmount: parseFloat(row.total_amount),
        installments: row.installments,
        perInstallment: parseFloat(row.per_installment),
        status: row.status,
        createdDate: row.created_at
    }
}

// Transform payment from DB
function transformPaymentFromDB(row) {
    if (!row) return null
    return {
        id: row.id,
        debtId: row.debt_id,
        installmentNumber: row.installment_number,
        amount: parseFloat(row.amount),
        dueDate: row.due_date,
        paid: row.paid,
        paidDate: row.paid_date
    }
}
