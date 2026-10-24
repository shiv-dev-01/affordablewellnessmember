import React from "react";
import { format } from "date-fns";
import type { Order } from "../../../types/orders";
import bottel_img from "../../../assets/img/bottel_img.png";

interface OrderInfoProps {
  order: Order;
}

const MainProductCard: React.FC<{
  product: NonNullable<Order["products"]>[0];
}> = ({ product }) => (
  <div className="flex items-center gap-4">
    <img
      src={product.product_img || bottel_img}
      alt={product.product_name}
      className="w-24 h-24 object-contain bg-gray-50 rounded-lg"
    />
    <div className="w-full">
      <h3 className="text-lg font-medium text-gray-900">
        {product.product_name}
      </h3>
      <p className="text-gray-500">SKU: {product.sku}</p>
      <div className="mt-4 space-y-1">
        <div className="flex justify-between text-gray-700">
          <span>Price:</span>
          <span className="font-medium">${product.product_price}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Quantity:</span>
          <span className="font-medium">{product.quantity}</span>
        </div>
      </div>
    </div>
  </div>
);

const AdditionalProductCard: React.FC<{
  product: NonNullable<Order["products"]>[0];
}> = ({ product }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    <img
      src={product.product_img || bottel_img}
      alt={product.product_name}
      className="w-16 h-16 object-contain bg-white rounded"
    />
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium text-gray-900 truncate">
        {product.product_name}
      </h4>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-500">SKU: {product.sku}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">${product.product_price}</span>
          <span className="text-xs text-gray-500">x{product.quantity}</span>
        </div>
      </div>
    </div>
  </div>
);

export function OrderInfo({ order }: OrderInfoProps) {
  // Handle legacy single product structure
  if (!order.products || order.products.length === 0) {
    return (
      <div className="card">
        {order?.fullorderData?.order_status == 1 && (
          <div className="flex justify-end items-center">
            <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-lg dark:bg-white-700 dark:text-red-500 border border-red-400 whitespace-nowrap">
              Subscription Cancelled
            </span>
          </div>
        )}
        <div className="flex items-center gap-4">
          <img
            src={order.productImage || bottel_img}
            alt={order.productImage ? order.productName : "bottel image"}
            className="w-24 h-24 object-contain bg-gray-50 rounded-lg"
          />
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {order.productName}
            </h3>
            <p className="text-gray-500">{order.dosage}</p>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">
                  ${order.fullorderData?.totalsBreakdown?.subtotal}
                </span>
              </div>
              {parseFloat(order.fullorderData?.totalsBreakdown?.subtotal) -
                parseFloat(order.fullorderData?.totalsBreakdown?.total) >
                0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Discount:</span>
                    <span className="font-medium text-red-500">
                      - $
                      {(
                        parseFloat(
                          order.fullorderData?.totalsBreakdown?.subtotal
                        ) -
                        parseFloat(order.fullorderData?.totalsBreakdown?.total)
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
              <div className="flex justify-between text-gray-700">
                <span>Paid Amount:</span>
                <span className="font-medium text-green-500">
                  ${order.fullorderData?.totalsBreakdown?.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="font-medium mt-1">
              {format(new Date(order.date), "MMM d, yyyy")}
            </p>
          </div>
          {order.nextBillingDate == "0000-00-00" ? null : (
            <div>
              <p className="text-sm text-gray-500">Next Billing Date</p>
              <p className="font-medium mt-1">
                {order?.nextBillingDate
                  ? format(new Date(order?.nextBillingDate), "MMM d, yyyy")
                  : "N/A"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const mainProduct = order.products[0];
  const additionalProducts = order.products.slice(1);

  const combinedSubtotal = order.products.reduce(
    (sum, product) =>
      sum + parseFloat(product.product_price) * parseInt(product.quantity),
    0
  );

  return (
    <div className="card space-y-6">
      {order?.fullorderData?.order_status == 1 && (
        <div className="flex justify-end items-center">
          <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-lg dark:bg-white-700 dark:text-red-500 border border-red-400 whitespace-nowrap">
            Subscription Cancelled
          </span>
        </div>
      )}

      <MainProductCard product={mainProduct} />

      {additionalProducts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Additional Products
          </h4>
          <div className="space-y-2">
            {additionalProducts.map((product) => (
              <AdditionalProductCard
                key={product.product_id}
                product={product}
              />
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t space-y-1">
        <div className="flex justify-between text-gray-700">
          <span>Combined Subtotal:</span>
          <span className="font-medium">${combinedSubtotal.toFixed(2)}</span>
        </div>

        {mainProduct.totalsBreakdown?.coupon_discount_amount &&
          parseFloat(mainProduct.totalsBreakdown.coupon_discount_amount) >
          0 && (
            <div className="flex justify-between text-gray-700">
              <span>Coupon Discount:</span>
              <span className="font-medium text-red-500">
                - $
                {parseFloat(
                  mainProduct.totalsBreakdown.coupon_discount_amount
                ).toFixed(2)}
              </span>
            </div>
          )}
        <div className="flex justify-between text-gray-700">
          <span>Total Paid:</span>
          <span className="font-medium text-green-500">
            ${combinedSubtotal.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Order Date</p>
          <p className="font-medium mt-1">
            {format(new Date(order.date), "MMM d, yyyy")}
          </p>
        </div>
        {order.nextBillingDate === "0000-00-00" ? null : (
          <div>
            <p className="text-sm text-gray-500">Next Billing Date</p>
            <p className="font-medium mt-1">
              {order.nextBillingDate
                ? format(new Date(order.nextBillingDate), "MMM d, yyyy")
                : "N/A"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
