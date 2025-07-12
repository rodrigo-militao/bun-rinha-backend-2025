import { Elysia } from "elysia";
import PublishPaymentUseCase from "../../../core/application/useCase/publish-payment.use-case";
import GetPaymentSummaryUseCase from "../../../core/application/useCase/get-payment-summary.use-case";

export const paymentsController = (
  publishPaymentUseCase: PublishPaymentUseCase,
  getPaymentSummaryUseCase: GetPaymentSummaryUseCase
) => 
  new Elysia()
  .post("/payments", async ({ body, status }) => {
    try {

      const { amount, correlationId } = body as { amount: number; correlationId: string };

      await publishPaymentUseCase.execute(amount, correlationId);

      return status(202);

    } catch (error) {

      console.error("Payment processing failed:", error);
      return status(500);
    }
  })
  .get("/payments-summary", async ({ query: {from, to}, status }) => {

    try {
      const response = await getPaymentSummaryUseCase.execute(from, to);
  
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error("Error fetching payment summary:", error);
      return status(500);
    }
  })