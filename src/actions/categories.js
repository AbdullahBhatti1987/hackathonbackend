const addCategory = async (obj) => {
    try {
        const response = await fetch(`${process.env.BASE_URL}api/categories`, {
            method: 'POST',  // Specify the request method
            headers: {
                'Content-Type': 'application/json',  // Tell the server we're sending JSON
            },
            body: JSON.stringify(obj),  // Convert the object into a JSON string
        });

        // Check if the request was successful (status 200-299)
        if (!response.ok) {
            throw new Error('Failed to add category');
        }

        const addedCategory = await response.json();  // Parse the response body as JSON

        console.log('Category added:', addedCategory);

        // Revalidate path or perform any necessary UI updates
        revalidatePath('/admin/categories');
    } catch (error) {
        console.error('Error adding category:', error);  // Log the error if request fails
    }
};
