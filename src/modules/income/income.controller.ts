import { Request, Response } from "express";
import incomeService from "./income.service";
import { createIncomeSchema, updateIncomeSchema } from "./income.validation";

class IncomeController {
  async createIncome(req: Request, res: Response) {
    const parsed = createIncomeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Please provide all the details",
      });
    }

    const data = await incomeService.create(parsed.data);

    return res.status(200).json({
      message: "income successfully created",
      data,
    });
  }

  async getIncome(req: Request, res: Response) {
    const data = await incomeService.findAll();
    if (!data) {
      return res.status(400).json({
        message: "income records not found",
      });
    }

    return res.status(200).json({
      message: "fetched income records",
      data,
    });
  }

  async getSingleIncome(req: Request, res: Response) {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        message: "id is required",
      });
    }

    const data = await incomeService.findById(id);
    if (!data) {
      return res.status(400).json({
        message: "record not found",
      });
    }

    return res.status(200).json({
      message: "record fetched successfully",
      data,
    });
  }

  async updateIncome(req: Request, res: Response) {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        message: "id is required",
      });
    }

    const parsed = updateIncomeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
      });
    }

    const updatedData = await incomeService.update(id, parsed.data);
    if (!updatedData) {
      return res.status(400).json({
        message: "record not found",
      });
    }

    return res.status(200).json({
      message: "records updated successfully",
      updatedData,
    });
  }

  // Was left as an incomplete stub (`async deleteIncome` with no body) in the
  // original incomeController.ts — implemented here as a soft delete to match
  // the project's paranoid-mode pattern used everywhere else.
  async deleteIncome(req: Request, res: Response) {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        message: "id is required",
      });
    }

    const deletedData = await incomeService.softDelete(id);
    if (!deletedData) {
      return res.status(400).json({
        message: "record not found",
      });
    }

    return res.status(200).json({
      message: "record deleted successfully",
      deletedData,
    });
  }
}

export default new IncomeController();
