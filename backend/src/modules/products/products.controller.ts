import { Body, Controller, Delete, Get, Param, Post, Put, ValidationPipe } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ResponseData } from "src/global/globalClass";
import { HttpMessage, HttpStatus } from "src/global/globalEnum";
import { Product } from "src/models/product.model";
import { productDTO } from "src/dto/product.dto";

@Controller('products')

export class ProductController {

    constructor(private readonly productService: ProductService){}

    @Get()
    getProducts(): ResponseData<Product> {
        try{
            return new ResponseData<Product>( this.productService.getProducts(), HttpStatus.SUCCESS, HttpMessage.SUCCESS);
        }
        catch(err){
            return new ResponseData<Product>( this.productService.getProducts(), HttpStatus.ERROR, HttpMessage.ERROR);
        }
    }

    @Post()
    createProduct(@Body(new ValidationPipe()) productDto: productDTO): ResponseData<Product> {
        try{
            return new ResponseData<Product>( this.productService.createProduct(productDto), HttpStatus.SUCCESS, HttpMessage.SUCCESS);
        }
        catch(err){
            return new ResponseData<Product>( null, HttpStatus.ERROR, HttpMessage.ERROR);
        }
    }

    @Get('/:id')
    detailsProduct(@Param('id') id: number): ResponseData<Product> {
        try{
            return new ResponseData<Product>(this.productService.detailsProduct(id), HttpStatus.SUCCESS, HttpMessage.SUCCESS);
        }
        catch(err){
            return new ResponseData<Product>( null, HttpStatus.ERROR, HttpMessage.ERROR);
        }
    }
    @Put('/:id')
    updateProduct(@Body(new ValidationPipe) productDTO: productDTO, @Param('id') id : number): ResponseData<Product> {
        try{
            return new ResponseData<Product>( this.productService.updateProduct(productDTO, id), HttpStatus.SUCCESS, HttpMessage.SUCCESS);
        }
        catch(err){
            return new ResponseData<Product>(null, HttpStatus.ERROR, HttpMessage.ERROR);
        }
    }

    @Delete('/:id')
    deleteProduct(@Param('id') id: number): ResponseData<boolean> {
        try{
            return new ResponseData<boolean>( this.productService.deleteProduct(id), HttpStatus.SUCCESS, HttpMessage.SUCCESS);
        }
        catch(err){
            return new ResponseData<boolean>( null, HttpStatus.ERROR, HttpMessage.ERROR);
        }
    }
}