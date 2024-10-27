document.getElementById('payment-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent form submission

    const amount = document.getElementById('amount').value; // Get amount from input
    const currency = 'INR';

    // Create a Razorpay order through the backend
    const orderResponse = await fetch('http://localhost:5000/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, currency }),
    });

    const orderData = await orderResponse.json();

    const options = {
        key: 'YOUR_RAZORPAY_KEY', // Replace with your Razorpay key ID
        order_id: orderData.id, // Use the id of the order created on the backend
        name: 'Your Company Name',
        description: 'Test Transaction',
        handler: function (response) {
            // This function will handle successful payment
            console.log(response);
            window.location.href = 'success.html'; // Redirect to success page
        },
        prefill: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            contact: '9999999999'
        },
        theme: {
            color: '#F37254'
        }
    };

    const rzp = new Razorpay(options);
    rzp.open(); // Open the Razorpay payment modal
});
