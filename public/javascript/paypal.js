paypal
  .Buttons({
    // Sets up the transaction when a payment button is clicked

    style: {
      color: "blue",
      shape: "pill",
    },
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              value: Number($("#cartTotal4").html()), // Can also reference a variable or function
            },
          },
        ],
      });
    },

    // Finalize the transaction after payer approval
    onApprove: (data, actions) => {
      return actions.order.capture().then(function (orderData) {
        // Successful capture! For dev/demo purposes:
        console.log(
          "Capture result",
          orderData,
          JSON.stringify(orderData, null, 2)
        );
        console.log(orderData);
        const transaction = orderData.purchase_units[0].payments.captures[0];

        // alert(`Transaction ${transaction.status}: ${transaction.id}\n\nSee console for all available details`);
        paypal();
        function paypal() {
          $.ajax({
            url: "/api/checkout/Online",
            type: "POST",
            data: {
              id: checkoutID,
              transId: `${transaction.id}`,
              walletUsed:$('#cartWallet').html(),
              paid:$('#cartTotal3').val()
            },
            dataType: "json",
            encode: true,
          }).done(function (response) {
            if (response.success == true) {
              $("#CheckoutLastBtn").prop("disabled", true).html("APPROVED!");
              $("#dashResponse").html(
                '<div class="alert alert-success alert-dismissible"> ' +
                  '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
                  "<strong>Success!</strong> " +
                  response.message +
                  "</div>"
              );
              successOrderPlaced();
            } else {
              $("#CheckoutLastBtn").prop("disabled", false).html("Try Again!");
              $("#dashResponse").html(
                '<div class="alert alert-danger alert-dismissible"> ' +
                  '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
                  "<strong>Error!</strong> " +
                  response.message +
                  "</div>"
              );
            }
          });
        }
        // When ready to go live, remove the alert and show a success message within this page. For example:

      });
    },

    onCancel:function (data) {
      window.location.replace("http://localhost:8081/paymentFailed")
      
    }
  })
  .render("#paypal-button-container");
