const express=require("express");
const fs=require("fs");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const cors=require("cors");

const app=express();
app.use(express.json());
app.use(cors());

if(!fs.existsSync("users.json"))fs.writeFileSync("users.json","[]");

const users=()=>JSON.parse(fs.readFileSync("users.json"));

const auth=(req,res,next)=>{
  try{
    req.user=jwt.verify(req.headers.authorization,"SECRET");
    next();
  }catch{res.sendStatus(403);}
};

app.post("/api/register",async(req,res)=>{
  const u=users();
  u.push({user:req.body.user,pass:await bcrypt.hash(req.body.pass,10),admin:false});
  fs.writeFileSync("users.json",JSON.stringify(u));
  res.json({ok:true});
});

app.post("/api/login",async(req,res)=>{
  const u=users().find(x=>x.user===req.body.user);
  if(!u||!await bcrypt.compare(req.body.pass,u.pass))return res.sendStatus(401);
  res.json({token:jwt.sign({user:u.user,admin:u.admin},"SECRET")});
});

app.post("/api/post",auth,(req,res)=>{
  if(/\d{3}-\d{2}-\d{4}/.test(req.body.content))
    return res.json({error:"personal data detected"});
  const id=Date.now().toString();
  fs.writeFileSync(`posts/${id}.json`,JSON.stringify({...req.body,author:req.user.user}));
  res.json({id});
});

app.get("/api/admin/posts",auth,(req,res)=>{
  if(!req.user.admin)return res.sendStatus(403);
  res.json(fs.readdirSync("posts"));
});

app.delete("/api/admin/post/:id",auth,(req,res)=>{
  if(!req.user.admin)return res.sendStatus(403);
  fs.unlinkSync(`posts/${req.params.id}.json`);
  res.json({deleted:true});
});

app.listen(3000,()=>console.log("backend running"));
