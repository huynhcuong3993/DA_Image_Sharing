import { Injectable } from "@nestjs/common";
import { ProductController } from "./products.controller";
import { Product } from "src/models/product.model";
import { productDTO } from "src/dto/product.dto";
@Injectable()
export class ProductService {

    private products: Product[] = [
        {id: 1, category: "Electronics", productName: "Laptop", price: 500},
        {id: 2, category: "Electronics", productName: "Laptop", price: 500},
        {id: 3, category: "Electronics", productName: "Laptop", price: 500},
    ];
    getProducts() :  Product[]{
        return this.products;
    }
    detailsProduct(id: Number): Product {
        return this.products.find(product => product.id === Number(id));
    }
    createProduct(productDto : productDTO):Product {
        const newProduct = {
            id: this.products.length + 1,
            category: productDto.category_id,
            productName: productDto.productName,
            price: productDto.price
        }
        this.products.push(newProduct);
        return newProduct;
    }
    updateProduct(productDto : productDTO, id: number): Product {
        const index = this.products.findIndex(product => product.id === Number(id));
        this.products[index].category = productDto.category_id;
        this.products[index].productName = productDto.productName;
        this.products[index].price = productDto.price;

        return this.products[index];
    }
    deleteProduct(id: number): boolean {
        const index = this.products.findIndex(product => product.id === Number(id));
        if(index !== -1){
            this.products.splice(index, 1);
            return true;
        }
        return false;
        
    }
}