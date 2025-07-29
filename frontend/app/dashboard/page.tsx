"use client"

import { Appbar } from "@/components/Appbar";
import { DarkButton } from "@/components/buttons/DarkButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL, HOOKS_URL } from "../config";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation" 
import { LinkButton } from "@/components/buttons/LinkButton";


interface Zap {
  id: string;
  triggerId: string;
  createdAt: string;
  action: {
    id: string;
    zapId: string;
    actionId: string;
    sortingOrder: number;
    type: {
      id: string;
      name: string;
      image: string;
    };
  }[];
  trigger: {
    id: string;
    zapId: string;
    triggerId: string;
    type: {
      id: string;
      name: string;
      image: string;
    };
  } | null;
}



function useZaps(){
  const [loading,setLoading] = useState(true)
  const [zaps,setZaps] = useState<Zap[]>([])

  useEffect(()=>{
       axios.get(`${BACKEND_URL}/api/v1/zap`, {
        headers: {
            "Authorization": localStorage.getItem("token")
        }
       })
            .then( res => {
              setZaps(res.data.zaps)
              setLoading(false)
            })
  },[]);

  return {
    loading , zaps
  }
}

export default function (){
  const {loading, zaps}=useZaps()
  const router=useRouter()

  return <div>
    <Appbar/>
    <div className="flex justify-center">
      <div className="flex justify-between pt-8 max-w-screen-lg pr-8 w-full">
        <div className="text-2xl font-bold">
          My Zaps
        </div>
        <DarkButton onClick={()=>{router.push("/zap/create")}}>Create</DarkButton>
      </div>
      </div>
    {loading ? "Loading..." : <div className="flex justify-center"><ZapTable zaps={zaps}/></div>}
  </div>
}


function ZapTable({ zaps }: {zaps: Zap[]}) {
const router = useRouter()

  return (
    <div className="p-8 max-w-screen-xl">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Name</TableHead>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead className="w-[200px]">Created at</TableHead>
          <TableHead className="w-[100px]">Webhook Url</TableHead>
          <TableHead className="w-[100px]">Go</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {zaps.map((z) => (
          <TableRow key={z.id}>
            <TableCell className="flex gap-2">
                   {[z.trigger?.type, ...(z.action ?? []).map(x => x.type)]
                    .filter(Boolean)
                    .map((t, index) => (
                      <img
                        key={index}
                        src={t.image}
                        alt={t.name}
                        className="w-6 h-6 rounded"
                      />
                    ))}
            </TableCell>
            <TableCell>{z.id}</TableCell>
            <TableCell>{new Date(z.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>{`${HOOKS_URL}/hooks/catch/1/${z.id}`}</TableCell>
            <TableCell>
              <LinkButton
                variant="outline"
                onClick={() => router.push("/zap/" + z.id)}
              >
                Go
              </LinkButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
}