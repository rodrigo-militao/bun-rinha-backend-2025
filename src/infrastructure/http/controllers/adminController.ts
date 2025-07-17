import Elysia from "elysia";
import PurgePaymentsUseCase from "../../../core/application/useCase/purge-payments.use-case";

export const adminController = (
  purgePaymentsUseCase: PurgePaymentsUseCase
) => 
  new Elysia()
.post("/purge-payments", async ({ body, status }) => {
  try {
    await purgePaymentsUseCase.execute();

    console.log('Payments purged successfully.');
  } catch (error) {
    console.log('Purge payments error');
  }
})
