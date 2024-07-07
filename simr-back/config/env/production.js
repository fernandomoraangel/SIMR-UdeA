module.exports={
	db:'mongodb://localhost/simr',
	//Si no es local mongodb://usuario:pass@hostname:puerto/basedatos
	sessionSecret:'developmentSessionSecret',
	google:{
		clientID:'424952915433-7ejq1nho03771k9nc8rmdqmasqjfsqr7.apps.googleusercontent.com',
		clientSecret:'S0l1DWc4y0NMYSpDmyrxy3kL',
		callbackURL:'http://localhost:3000/oauth/google/callback'
	}
};
