var bg;
var blops=[];
var waves=[];
var player;
var prince;
var prevMS;

function setup() {
	createCanvas(400,400);
	bg=createGraphics(width,height);
	blops_make();
	prince=new Prince();
	player=new Mermaid(prince);
	for(var i=0;i<50;i++)
	{
		waves[i]=new Wave(prince);
	}
	sea_bg(bg);
	prevMS=millis();
}

function draw() {
	image(bg,0,0);
	blops_control();
	waves_control();
	prince.render();
	player.execute();
	player.render();
	player.renderPtc();
	prevMS=millis();
}

function mousePressed()
{
	var i;
	for(i=0;i<50;i++)
	{
		if(waves[i].isRun==false) break;
	}
	waves[i].create(player.x,player.y);
	player.hp-=1000;
}

function sea_bg(canvas)
{
	var c1=color(171,254,246);
	var c2=color(12,104,215);
	canvas.strokeWeight(1);
	canvas.noFill();
	for(var i=0;i<height;i++)
	{
		canvas.stroke(lerpColor(c1, c2, i/height));
		canvas.line(0,i,width,i);
	}
}

function blops_make()
{
	for(var i=0;i<12;i++)
	{
		blops[i]=new blop(i*1500);
	}
}

function blops_control()
{
	for(var i=0;i<12;i++)
	{
		blops[i].newCheck();
		if(blops[i].isRun)
		{
			blops[i].move();
			blops[i].render();
			blops[i].destroyCheck();
		}
	}
}

function waves_control()
{
	var i;
	for(i=0;i<50;i++)
	{
		if(waves[i].isRun)
		{
			waves[i].execute();
			waves[i].render();
		}
	}
	for(i=0;i<50;i++)
	{
		waves[i].destroyCheck();
	}
}

function getDir(c_X, c_Y, p_X, p_Y, ForB)
{
	var mousePos=createVector(c_X,c_Y);
	var PmousePos=createVector(p_X,p_Y);
	var a;
	if(ForB==1) a=p5.Vector.sub(mousePos,PmousePos);	//front
	else a=p5.Vector.sub(PmousePos,mousePos);	//back
	return a.heading();
}

//====================class=====================//

function blop(delay)
{
	this.x=0; this.y=0;
	this.size=0; this.Yvel=2; this.Xdif=0;
	this.delaySec=delay;
	this.isRun=false;
	this.create=function()
	{
		var std=min(width,height)/12;
		this.size=random(0.8,1.2)*std;
		this.Xdif=random(1,2)*width/1366;
		this.Yvel=2;
		this.x=random(this.size,width-this.size);
		this.y=height+std*2;
	};
	this.newCheck=function()
	{
		if(this.delaySec<millis()&&this.isRun==false)
		{
			this.create();
			this.isRun=true;
		}
	}
	this.move=function()
	{
		this.x+=sin((height-this.y)*PI/120)*this.Xdif;
		this.y-=this.Yvel;
	};
	this.render=function()
	{
		noStroke();
		fill(255,32);
		push();
		translate(this.x,this.y);
		ellipse(0,0,this.size,this.size);
		ellipse(this.size/5,-this.size/5,this.size/4,this.size/4);
		pop();
	};
	this.destroyCheck=function()
	{
		if(this.y<-this.size)
		{
			this.create();
		}
	}
}

function Mermaid(Prince)
{
	this.hp=60000;
	this.x=width*2/3;
	this.y=height*2/3
	this.dir=0;
	this.opponent=Prince;
	this.particles=[];
	this.execute=function()
	{
		var pos=createVector(mouseX,mouseY);
		var cen=createVector(width/2,height/2);
		var diff=p5.Vector.sub(pos,cen);
		var barrierRadius=this.opponent.barrierRadius;
		var prevX=this.x;
		var prevY=this.y;
		if(diff.mag()>barrierRadius)
		{
			this.x=mouseX;
			this.y=mouseY;
		}
		else
		{
			diff.setMag(barrierRadius);
			cen.add(diff);
			this.x=cen.x;
			this.y=cen.y;
			this.hp-=200;
		}
		if(this.x!=prevX||this.y!=prevY)
		{
			this.dir=getDir(this.x, this.y, prevX, prevY, 0);
		}
		this.hp-=(millis()-prevMS);
	}
	this.render=function()
	{
		var std=min(width,height)/10*(this.hp/60000);
		var sw=2*min(width,height)/768;
		noFill();
		stroke(255);
		strokeWeight(sw);
		rectMode(CENTER);
		push();
		translate(this.x,this.y);
		ellipse(0,0,std,std);
		push();
		rotate(radians(45));
		rect(0,0,std*0.8,std*0.8);
		pop();
		rect(0,0,std*0.4*sqrt(2),std*0.4*sqrt(2));
		pop();
		rectMode(CORNER);
	}
	this.renderPtc=function()	
	{
		if(frameCount%10==0)
		{
			this.particles.push(new effectParticle());
			this.particles[this.particles.length-1].create(this.x,this.y,this.dir);
		}
		noFill();
		strokeWeight(min(width,height)/768);
		stroke(255);
		for(var i=0;i<this.particles.length;i++)
		{
			this.particles[i].execute();
		}
		if(this.particles.length>0)
		{
			if(this.particles[0].size<=0) this.particles.shift();
		}
	}
}

function effectParticle()
{
	this.pos=createVector();
	this.acc=createVector(2,0);
	this.size=15;
	this.create=function(x,y,dir)
	{
		this.pos=createVector(x,y);
		this.acc=p5.Vector.fromAngle(dir+radians(random(-30,30)),2);
		this.size=15;
	}
	this.execute=function()
	{
		this.pos.add(this.acc);
		this.size-=0.5;
		ellipse(this.pos.x,this.pos.y,this.size,this.size);
	}
}

function Wave(Prince)
{
	this.power=0;
	this.x=0;
	this.y=0;
	this.r=0;
	this.isRun=false;
	this.opponent=Prince;
	this.create=function(X,Y)
	{
		this.x=X;
		this.y=Y;
		this.r=0;
		this.power=255;
		this.isRun=true;
	}
	this.execute=function()
	{
		this.power-=5;
		this.r+=2.5;
	}
	this.render=function()
	{
		noFill();
		stroke(255,this.power);
		strokeWeight(2);
		ellipse(this.x,this.y,this.r*2,this.r*2);
	}
	this.destroyCheck=function()
	{
		if(dist(this.x,this.y,width/2,height/2)<=this.r+this.opponent.barrierRadius)
		{
			this.opponent.breakBarrier(this.power);
			this.isRun=false;
		}
		else if(this.power<=0)
		{
			this.isRun=false;
		}
	}
}

function Prince()
{
	this.maxBR=min(width,height)/6
	this.barrierRadius=this.maxBR;
	this.barrierHealth=15300;
	this.breakBarrier=function(damage)
	{
		this.barrierHealth-=damage;
		this.barrierRadius=map(this.barrierHealth,0,15300,0,this.maxBR);
	}
	this.render=function()
	{
		this.renderBarrier();
		this.renderPrince();
	}
	this.renderBarrier=function()
	{
		strokeWeight(4);
		stroke(255,255);
		fill(255,10);
		if(this.barrierRadius>0)
		{
			ellipse(width/2,height/2,this.barrierRadius*2,this.barrierRadius*2);
		}
	}
	this.renderPrince=function()
	{
		var std=min(width,height)/10;
		noStroke();
		fill("#fff599");
		push();
		translate(width/2,height/2);
		rotate(radians(10*sin(radians(frameCount))+55));
		ellipse(0,0,std,std);
		translate(-std/2,0);
		rotate(radians(45));
		rectMode(CENTER);
		rect(0,0,std/2,std/2);
		rectMode(CORNER);
		pop();
	}
}
