// const escpos = require('escpos');
// escpos.USB = require('escpos-usb'); // Ensure USB connection is handled

// const device = new escpos.USB(); // Initialize USB connection
// const printer = new escpos.Printer(device);

// const printKitchenReceipt = async (orderData) => {
//   return new Promise((resolve) => { // Removed reject, ensuring no unhandled errors
//     device.open((err) => {
//       // if (err) {
//       //   console.warn("Printer connection failed. Skipping print...");
//       //   resolve("Printer not found, skipping print.");
//       //   return;
//       // } 

//       if (err) {
//         console.error("Printer connection failed: ", err);
//         resolve({ success: false, message: "Printing failed", error: err });
//         return;
//       }

//       // Extracting date in "MM/DD" format
//       // const formattedDate = orderData.date_time.split(' ')[0].slice(-5); 

//       printer        
//         .align('ct')
//         .size(0, 0) 
//         .text('KITCHEN ORDER')
//         // .size(0, 0)
//         .text('-----------------------')
//         .align('lt')        
//         .text(`Table: ${orderData.table_number}     Order ID: ${orderData.order_id}`)       
//         .text(`Type: ${orderData.order_type}`)
//         .text(`Date: ${orderData.date_time}`)
//         .align('ct')
//         .text('-----------------------')
//         .align('lt')

//       orderData.items.forEach((item) => {
//         printer.text(`${item.quantity}x ${item.name}`);
//         if (item.special_request) {
//           printer.text(` (${item.special_request})`); // Indent comment with an icon
//         }
//         printer.text('');
//       });

//       printer
//         .align('ct')
//         .text('-----------------------')
//         .cut()
//         .close(() => resolve("Receipt Printed Successfully")); 
//     });
//   });
// };

// const printPaymentBill = async (orderData) => {
//   return new Promise((resolve) => {
//     device.open((err) => {
//       if (err) {
//         console.error("Printer connection failed: ", err);
//         resolve({ success: false, message: "Printing failed", error: err });
//         return;
//       }

//       printer
//         .align('ct')
//         .size(0, 0)
//         .text('PAYMENT BILL')
//         .text('-----------------------')
//         .align('lt')
//         .text(`Table: ${orderData.table_number}     Order ID: ${orderData.order_id}`)
//         .text(`Order Type: ${orderData.order_type}`)
//         .text(`Date: ${orderData.date_time}`)
//         .align('ct')
//         .text('-----------------------')
//         .align('lt');

//       orderData.items.forEach((item) => {
//         printer.text(`${item.quantity}x ${item.name} - $${Number(item.price).toFixed(2)}`);
//         // if (item.special_request) {
//         //   printer.text(` (${item.special_request})`);
//         // }
//         // printer.text('');
//       });

//       printer
//         .align('ct')
//         .text('-----------------------')
//         .align('rt')
//         .text(`Payment: ${orderData.payment_type}`)
//         .text(`Subtotal: $${Number(orderData.subtotal).toFixed(2)}`)
//         .text(`GST (9%): $${Number(orderData.gst).toFixed(2)}`)
//         .text(`Discount: $${Number(orderData.discount).toFixed(2)}`)
//         .align('ct')
//         .text('-----------------------')
//         .text(`Total: $${Number(orderData.total_amount).toFixed(2)}`)        
//         .text('-----------------------')        
//         .text('Thank You! Please Visit Again!')
//         .cut()
//         .close(() => resolve("Payment Bill Printed Successfully"));
//     });
//   });
// };

// module.exports = { printKitchenReceipt, printPaymentBill };

const escpos = require('escpos');

let device;
let printer;

try {
  escpos.USB = require('escpos-usb'); // Load USB module
  device = new escpos.USB(); // Attempt to initialize USB connection
  printer = new escpos.Printer(device);
} catch (error) {
  console.warn("⚠️ Warning: No printer found. Printing will be skipped.");
  device = null; // Prevents further errors
}

const printKitchenReceipt = async (orderData) => {
  return new Promise((resolve) => {
    if (!device) {
      console.warn("⚠️ Printer is unavailable. Skipping print...");
      resolve("Printer not found, skipping print.");
      return;
    }

    device.open((err) => {
      if (err) {
        console.warn("⚠️ Unable to connect to printer. Skipping print...");
        resolve("Printer connection failed, skipping print.");        
        return;
      }

      printer        
        .align('ct')
        .size(0, 0) 
        .text('KITCHEN ORDER')
        .size(0, 0)
        .text('-----------------------')
        .align('lt')
        .style('B')
        .text(`Table: ${orderData.table_number}     Order ID: ${orderData.order_id}`)
        .style('NORMAL')
        .text(`Type: ${orderData.order_type}`)
        .text(`Date: ${orderData.date_time}`)
        .align('ct')
        .text('-----------------------')
        .align('lt')

      orderData.items.forEach((item) => {
        printer.text(`${item.quantity}x ${item.name}`);
        if (item.special_request) {
          printer.text(` (${item.special_request})`); // Indent comment with an icon
        }
        printer.text('');
      });

      printer
        .align('ct')
        .text('-----------------------')
        .cut()
        .close(() => resolve("Receipt Printed Successfully"));
    });
  });
};

const printPaymentBill = async (orderData) => {
  return new Promise((resolve) => {
    device.open((err) => {
      if (err) {
        console.error("Printer connection failed: ", err);
        resolve({ success: false, message: "Printing failed", error: err });
        return;
      }

      printer
        .align('ct')
        .size(0, 0)
        .text('PAYMENT BILL')
        .text('-----------------------')
        .align('lt')
        .text(`Table: ${orderData.table_number}     Order ID: ${orderData.order_id}`)
        .text(`Order Type: ${orderData.order_type}`)
        .text(`Date: ${orderData.date_time}`)
        .align('ct')
        .text('-----------------------')
        .align('lt');

      orderData.items.forEach((item) => {
        printer.text(`${item.quantity}x ${item.name} - $${Number(item.price).toFixed(2)}`);
        // if (item.special_request) {
        //   printer.text(` (${item.special_request})`);
        // }
        // printer.text('');
      });

      printer
        .align('ct')
        .text('-----------------------')
        .align('rt')
        .text(`Payment: ${orderData.payment_type}`)
        .text(`Subtotal: $${Number(orderData.subtotal).toFixed(2)}`)
        .text(`GST (9%): $${Number(orderData.gst).toFixed(2)}`)
        .text(`Discount: $${Number(orderData.discount).toFixed(2)}`)
        .align('ct')
        .text('-----------------------')
        .text(`Total: $${Number(orderData.total_amount).toFixed(2)}`)        
        .text('-----------------------')        
        .text('Thank You! Please Visit Again!')
        .cut()
        .close(() => resolve("Payment Bill Printed Successfully"));
    });
  });
};

module.exports = { printKitchenReceipt, printPaymentBill };
