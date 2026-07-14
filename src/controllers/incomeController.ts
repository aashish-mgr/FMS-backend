import Income from "../models/transactions/income";
import { Request, Response } from "express";
import { incomeType } from "../types/incomeType";

class incomeController {
  async createIncome(req: Request, res: Response) {
    const {
      amount,
      incomeCategoryId,
      paymentMethod,
      incomeSource,
      clientName,
      referenceNumber,
      invoiceNumber,
      description,
      transactionDate,
    } = req.body;
    if (!transactionDate || !amount || !incomeCategoryId || !paymentMethod) {
      return res.status(400).json({
        message: "Please provide all the details",
      });
    }
    const data = await Income.create({
      amount,
      incomeCategoryId,
      paymentMethod,
      incomeSource,
      clientName,
      referenceNumber,
      invoiceNumber,
      description,
      transactionDate,
    } as any);

    return res.status(200).json({
        message: "income successfully created",
        data
    })

    
  }

  async getIncome (req: Request, res: Response) {
    const data = Income.findAll();
    if(!data) {
      return res.status(400).json({
         message: "income records not found"
      })
    }

    return res.status(200).json({
      message: "fetched income records",
      data
    })
  }

  async getSingleIncome (req: Request,res: Response) {
      const {id} = req.params;
      if(!id) {
        return res.status(400).json({
          message: "id is required"
        })
      }
      const data = await Income.findOne({where: {id}});
      if(!data) {
        return res.status(400).json({
          message: "record not found"
        })
      }
      return res.status(200).json({
        message: "record fetched successfully",
        data
      })
  }

  async updateIncome (req: Request,res: Response) {
    const {
      amount,
      incomeCategoryId,
      paymentMethod,
      incomeSource,
      clientName,
      referenceNumber,
      invoiceNumber,
      description,
      transactionDate,
    } = req?.body;

    const {id} = req?.params;

    if(!id) {
      return res.status(400).json({
        message: "id is required"
      })
    }

    await Income.update({ amount,
      incomeCategoryId,
      paymentMethod,
      incomeSource,
      clientName,
      referenceNumber,
      invoiceNumber,
      description,
      transactionDate},{where: {id}});

      const updatedData = await Income.findOne({where: {id}});
      if(!updatedData) {
        return res.status(400).json({
          message: "record not found"
        });
      }

      return res.status(200).json({
        message: "records updated successfully",
        updatedData
      })
  }


}

export default new incomeController();
