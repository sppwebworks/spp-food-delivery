const handlePlaceOrder = async () => {
  if (isProcessing) return;

  if (!selected) return showToast("Please select a delivery address", "error");
  if (!isPhoneValid) {
    setPhoneTouched(true);
    return showToast("Please enter a valid 10-digit phone number", "error");
  }

  setIsProcessing(true);

  try {
    const payload = {
      items: items.map((i) => ({
        mealId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      subtotal,
      deliveryFee,
      packagingFee,
      tax,
      discount,
      total,
      address: {
        label: selected.label,
        line1: selected.line1,
        line2: selected.line2,
        city: selected.city,
        pincode: selected.pincode,
      },
      phone: phone.trim(),
      paymentMethod,
      couponCode: coupon?.code || null,
    };

    const result = await dispatch(createOrder(payload));
    if (!createOrder.fulfilled.match(result)) {
      showToast(result.payload || "Failed to place order", "error");
      setIsProcessing(false);
      return;
    }

    const orderId = result.payload._id;
    const serverTotal = result.payload.total;

    // COD
    if (paymentMethod === "cod") {
      dispatch(clearCart());
      showToast("Order placed — pay on delivery 🎉", "success");
      navigate(`/orders/${orderId}`);
      return;
    }

    // Initiate payment for stripe/razorpay
    const { data } = await api.post("/payments/initiate", {
      orderId,
      method: paymentMethod,
      amount: serverTotal,
    });

    // STRIPE
    if (paymentMethod === "stripe") {
      if (!data.clientSecret) {
        showToast("Stripe session failed — please retry", "error");
        setIsProcessing(false);
        return;
      }
      navigate(`/stripe-checkout/${orderId}`, {
        state: { clientSecret: data.clientSecret, amount: serverTotal },
      });
      return;
    }

    // RAZORPAY (covers UPI, cards, netbanking, wallets)
    if (paymentMethod === "razorpay") {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        showToast("Razorpay failed to load", "error");
        setIsProcessing(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "SPP FoodieApp",
        description: `Order #${orderId.slice(-6).toUpperCase()}`,
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              gateway: "razorpay",
            });
            dispatch(clearCart());
            showToast("Payment successful 🎉", "success");
            navigate(`/orders/${orderId}?paid=1&gateway=razorpay`);
          } catch (err) {
            showToast(
              err.response?.data?.message || "Payment verification failed",
              "error",
            );
            setIsProcessing(false);
          }
        },
        prefill: { contact: phone.trim() },
        theme: { color: "#fc8019" },
        modal: {
          ondismiss: () => {
            showToast("Payment cancelled", "error");
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      return;
    }

    // Fallback (should never hit since we removed phonepe/upi)
    dispatch(clearCart());
    showToast("Order placed 🎉", "success");
    navigate(`/orders/${orderId}`);
  } catch (err) {
    showToast(
      err.response?.data?.message || "Payment initiation failed",
      "error",
    );
    setIsProcessing(false);
  }
};
