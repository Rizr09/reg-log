declare module "midtrans-client" {
    // CoreApi class definition
    export class CoreApi {
      constructor(config: { isProduction: boolean; serverKey: string; clientKey?: string });
  
      charge(parameters: {
        payment_type: string;
        transaction_details: {
          order_id: string;
          gross_amount: number;
        };
        item_details?: Array<{
          id: string;
          price: number;
          quantity: number;
          name: string;
        }>;
        customer_details?: {
          first_name?: string;
          last_name?: string;
          email: string;
          phone?: string;
        };
        [key: string]: any;
      }): Promise<any>;
  
      // Add other methods of CoreApi as needed
    }
  
    // Snap class definition
    export class Snap {
      constructor(config: { isProduction: boolean; serverKey: string; clientKey: string });
  
      createTransaction(parameters: {
        transaction_details: {
          order_id: string;
          gross_amount: number;
        };
        item_details?: Array<{
          id: string;
          price: number;
          quantity: number;
          name: string;
        }>;
        customer_details?: {
          first_name?: string;
          last_name?: string;
          email: string;
          phone?: string;
        };
        credit_card?: {
          secure: boolean;
          [key: string]: any;
        };
        [key: string]: any;
      }): Promise<any>;
  
      createTransactionToken(parameters: {
        transaction_details: {
          order_id: string;
          gross_amount: number;
        };
        [key: string]: any;
      }): Promise<any>;
  
      createTransactionRedirectUrl(parameters: {
        transaction_details: {
          order_id: string;
          gross_amount: number;
        };
        [key: string]: any;
      }): Promise<any>;
  
      // Add other methods of Snap as needed
    }
  
    // Iris class definition
    export class Iris {
      constructor(config: { isProduction: boolean; serverKey: string; clientKey?: string });
  
      createBeneficiaries(parameters: { name: string; account: string; bank: string; alias_name?: string; [key: string]: any }): Promise<any>;
  
      getBeneficiaries(): Promise<any>;
  
      // Add other methods of Iris as needed
    }
  
    // MidtransError class definition
    export class MidtransError extends Error {
      httpStatusCode: number;
      ApiResponse: any;
      message: string;
      constructor(message: string, httpStatusCode: number, ApiResponse: any);
    }
  }