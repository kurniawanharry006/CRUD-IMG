import Product from "../models/ProductModel.js";
import path from 'path'
import fs from 'fs'

export const getProducts = async (req,res)=>{
    try {
        const response = await Product.findAll();
        res.json(response)
    } catch (error) {
        console.log(error.message);
    }
}

export const getProductsById = async (req,res)=>{
    try {
        const response = await Product.findOne({
            where:{
                id:req.params.id
            }
        });
        res.json(response)
    } catch (error) {
        console.log(error.message);
    }
}

export const saveProduct = async (req,res)=>{
    if(req.file === null) return res.status(400).json({msg:"No file uploaded"});
    const name =  req.body.title;
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowesType = ['.png','.jpg','.jpeg'];

    if(!allowesType.includes(ext.toLowerCase())) return res.status(422).json({msg:"Inavlid Images"});
    if(!fileSize > 5000000) return res.status(422).json({msg:"Images must be less than 5 MB"});

    file.mv(`./public/images/${fileName}`, async(err)=>{
        if(err) return res.status(500).json({msg:err.message})

        try {
            await Product.create({name:name,image:fileName,url:url})
            res.status(201).json({msg:"Product created successfuly"})
        } catch (error) {
            console.log(error.message);
        }
    })

}
export const updateProduct = async (req,res)=>{
    const product = await Product.findOne({
        where:{
            id:req.params.id
        }
    });

    if(!product) return res.status(404).json({msg:"No data found"});
    let fileName = "";
    if(req.files === null){
        fileName = Product.image
    } else {
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        fileName = file.md5 + ext;
        const allowesType = ['.png','.jpg','.jpeg'];

        if(!allowesType.includes(ext.toLowerCase())) return res.status(422).json({msg:"Inavlid Images"});
        if(!fileSize > 5000000) return res.status(422).json({msg:"Images must be less than 5 MB"});

        const filepath = `./public/images/${product.image}`
        fs.unlinkSync(filepath);

        file.mv(`./public/images/${fileName}`,(err)=>{
            if(err) return res.status(500).json({msg:err.message})
        })  
    }
    const name =  req.body.title;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    try {
        await Product.update({name:name,image:fileName,url:url},{
            where :{
                id:req.params.id
            }
        })
        res.status(200).json({msg:"Product updated successfuly"})
    } catch (error) {
        console.log(error.message);
    }
}

export const deleteProduct = async (req,res)=>{
    const product = await Product.findOne({
        where:{
            id:req.params.id
        }
    });

    if(!product) return res.status(404).json({msg:"No data found"});
    try {
        const filepath = `./public/images/${product.image}`
        fs.unlinkSync(filepath);
        await Product.destroy({
            where:{
                id:req.params.id
            }
        })
        res.status(200).json({msg:"Product deleted successfuly"})
    } catch (error) {
        console.log(error.message);
    }
}