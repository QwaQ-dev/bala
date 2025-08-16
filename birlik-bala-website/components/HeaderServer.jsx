// app/components/HeaderServer.tsx

import HeaderClient from "./HeaderClient";
import {getUserData} from "@/app/api/user"

export default async function HeaderServer() {
  const data = await getUserData()


  return <HeaderClient userData={data} />
}
