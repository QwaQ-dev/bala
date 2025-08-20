"use client"
import {useRouter} from "next/navigation";

export function redirect(){
    const router = useRouter();

    router.push("https://wa.me/77001234567"); 
}