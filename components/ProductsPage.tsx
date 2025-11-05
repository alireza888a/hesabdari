
import React from 'react';
import Products from './Products';
import { Product } from '../types';

interface ProductsPageProps {
  products: Product[];
  onAdd: (productData: Omit<Product, 'id' | 'code'>) => void;
  onUpdate: (productData: Omit<Product, 'id' | 'code'>, id: number) => void;
  onDelete: (id: number) => void;
  onDeleteMultiple: (ids: Set<number>) => void;
}

const ProductsPage: React.FC<ProductsPageProps> = (props) => {
    return (
        <div>
            <Products {...props} />
        </div>
    );
};

export default ProductsPage;
