export async function getUserData(){
    try {
        const userResponse = await fetch("http://localhost:8080/api/v1/auth/user-info", {
            credentials: 'include',
        })
        console.log(userResponse)
        if (userResponse.ok) {
          const userData = await userResponse.json()
          console.log("User data:", userData.user)
        }
    } catch (userError) {
    console.error("Failed to fetch user data:", userError)
    }
}