"use client";

import type { CartItem } from "@/types";

type Props = {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
};


export default function CartPanel({
  cart,
  addItem,
  removeItem,
}: Props) {

  return (
    <div
      className="
        w-full
        lg:w-96
        bg-slate-900
        border-l
        border-slate-800
        p-5
        flex
        flex-col
      "
    >

      <h2 className="text-lg font-bold mb-5">
        🛒 รายการสินค้า
      </h2>


      <div className="flex-1 overflow-y-auto">

        {
          cart.length === 0 ? (

            <div className="
              text-center
              text-slate-500
              mt-10
            ">
              ยังไม่มีสินค้า
            </div>

          ) : (

            cart.map(item => (

              <div
                key={item.id}
                className="
                  mb-3
                  rounded-xl
                  bg-slate-800
                  p-4
                "
              >

                <p className="font-semibold">
                  {item.name}
                </p>


                <p className="text-sm text-slate-400">
                  {item.price} บาท
                </p>


                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mt-3
                  "
                >

                  <button
                    onClick={() =>
                      removeItem(item.id)
                    }
                    className="
                      w-8
                      h-8
                      rounded-lg
                      bg-red-600
                    "
                  >
                    -
                  </button>


                  <span>
                    {item.quantity}
                  </span>


                  <button
                    onClick={() =>
                      addItem(item)
                    }
                    className="
                      w-8
                      h-8
                      rounded-lg
                      bg-green-600
                    "
                  >
                    +
                  </button>


                </div>


                <p className="
                  text-right
                  mt-3
                  text-emerald-400
                  font-bold
                ">
                  {(item.price * item.quantity).toFixed(2)} ฿
                </p>


              </div>

            ))

          )
        }

      </div>

    </div>
  );
}