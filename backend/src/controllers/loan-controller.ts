import { Request, Response } from 'express'
import * as loanService from '../services/loan-service'
import { calculateCurrentFine } from '../services/fine-service'

export const viewMyLoans = async (req: any, res: Response) => {
    try {
        const userId = req.user.id as string
        const loans = await loanService.getLoansByUser(userId)

        const updatedLoans = loans.map((loan: any) => ({
            ...loan,
            current_fine: loan.due_date ? calculateCurrentFine(loan.due_date) : 0
        }))

        res.status(200).json({
            success: true,
            count: updatedLoans.length,
            data: updatedLoans
        })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}

export const viewAllLoans = async (req: Request, res: Response) => {
    try {
        const allLoans = await loanService.getAllLoansInSystem()
        res.json({
            success: true,
            data: allLoans
        })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}
