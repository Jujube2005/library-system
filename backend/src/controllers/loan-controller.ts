import { Request, Response } from 'express'
import * as loanService from '../services/loan-service'
import { calculateCurrentFine } from '../services/fine-service'
import { Loan } from '../types/loan'

export const createLoan = async (req: any, res: Response) => {
  try {
    const staffId = req.user?.id as string | undefined
    const { userId, bookId } = req.body as {
      userId?: string
      bookId?: string
    }

    if (!staffId) {
      res.status(401).json({ error: 'UNAUTHENTICATED' })
      return
    }

    if (!userId || !bookId) {
      res.status(400).json({ error: 'MISSING_FIELDS' })
      return
    }

    const result = await loanService.createLoan(userId, bookId, staffId)

    res.status(201).json({
      data: result
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const viewMyLoans = async (req: any, res: Response) => {
  try {
    const userId = req.user.id as string
    const loans = await loanService.getLoansByUser(userId)

    const updatedLoans = loans.map((loan: any) => ({
      ...loan,
      current_fine: loan.due_date ? calculateCurrentFine(loan.due_date) : 0
    }))

    res.status(200).json({
      data: updatedLoans
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const viewAllLoans = async (_req: Request, res: Response) => {
  try {
    const allLoans = await loanService.getAllLoansInSystem()
    res.json({
      data: allLoans
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const returnLoan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!id) {
      res.status(400).json({ error: 'MISSING_LOAN_ID' })
      return
    }

    const result = await loanService.returnLoan(id)

    res.status(200).json({
      data: result
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const renewLoanHandler = async (req: any, res: Response) => {
  try {
    const userId = req.user.id as string
    const { id } = req.params

    if (!id) {
      res.status(400).json({ error: 'MISSING_LOAN_ID' })
      return
    }

    const result = await loanService.renewLoan(id, userId)

    res.status(200).json({
      data: result
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const renewLoanByStaff = async (req: Request, res: Response) => {
  try {
    const staffId = (req as any).user?.id as string | undefined
    const { id } = req.params
    const { userId } = req.body as { userId?: string }

    if (!staffId) {
      res.status(401).json({ error: 'UNAUTHENTICATED' })
      return
    }
    if (!id) {
      res.status(400).json({ error: 'MISSING_LOAN_ID' })
      return
    }
    if (!userId) {
      res.status(400).json({ error: 'MISSING_USER_ID' })
      return
    }

    const result = await loanService.renewLoanByStaff(id, userId, staffId)

    res.status(200).json({
      data: result
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const getLoanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!id) {
      res.status(400).json({ error: 'MISSING_LOAN_ID' })
      return
    }

    const loan = await loanService.getLoanById(id)

    if (!loan) {
      res.status(404).json({ error: 'LOAN_NOT_FOUND' })
      return
    }

    res.status(200).json({
      data: loan
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
