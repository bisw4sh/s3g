"use client";
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { Button } from '@/components/ui/button';
import DataTable from './DataTable';
import { columns } from './columns';
import { User } from '@/db/schema';
import { Spinner } from '@/components/Loader';
import { LoaderScreen } from '@/components/LoaderScreen';

type TResponse = {
  success?: boolean;
  message?: string;
  users: User[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function MyPaginatedComponent() {
  const [page, setPage] = useState<number>(1)
  const limit = 10

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['projects', page],
    queryFn: async (): Promise<TResponse> => {
      const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  if (isLoading) return <LoaderScreen />;
  if (isError) return <div>Error: {error.message}</div>;

  console.log(data)

  return (
    <main className='p-8 flex flex-col items-center gap-6'>
      <DataTable columns={columns} data={data?.users || []} />
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="secondary"
              className={`cursor-pointer ${page === 1 ? "invisible" : ""}`}
              onClick={() => { if (page > 1) { setPage(prev => prev - 1) } }}
            >
              Previous
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button variant="secondary" className='cursor-pointer' disabled>
              {page}
            </Button>
          </PaginationItem>
          <PaginationItem>
            {data && data.totalPages > page && (
              <Button
                variant="secondary"
                className='cursor-pointer'
                onClick={() => setPage(prev => prev + 1)}
              >
                Next
              </Button>
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </main>
  );
}
