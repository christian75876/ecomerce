import { IProductRequest } from "@/application/dtos/products/request/ProductRequest";
import { useSearchBar } from "@/application/useCases/products/useSearchBar";
import SearchBar from "@/presentation/ui/molecules/products/SearchBar"
import ProductBody from "@/presentation/ui/organisms/products/ProductBody"
import ProductHeader from "@/presentation/ui/molecules/products/ProductHeader"

const ProductsPage = () => {

    const { isloading, handleSearch } = useSearchBar();

    const onSubmit = (data: IProductRequest) => {
      handleSearch(data);
    };
    

    return (
        <>
        <ProductHeader title="Seleccionar productos" />
        <SearchBar onSubmit={onSubmit} isLoading={isloading} />
        <ProductBody/>
        </>
    )
}

export default ProductsPage