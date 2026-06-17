import { useState } from 'react';
import { IMetaData } from '@/application/dtos/common/HttpResponse';

export const usePagination = (defaultLimit = 20) => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(defaultLimit);

  const updateMeta = (meta: IMetaData) => {
    setTotalPages(meta.totalPages);
    setTotalItems(meta.totalItems);
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const reset = () => setPage(1);

  return {
    page,
    limit: itemsPerPage,
    totalPages,
    totalItems,
    itemsPerPage,
    updateMeta,
    goToPage,
    reset,
  };
};
