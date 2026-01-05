async function testCreateTribe() {
    console.log("Testing Create Tribe API...");
    try {
        const response = await fetch('http://localhost:3000/api/tribes/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "Debug Tribe",
                topic: "API Testing",
                meetingTime: "Wed 10am",
                matchmakingCriteria: "Developers",
                affiliateCommission: 10
            })
        });

        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

testCreateTribe();
