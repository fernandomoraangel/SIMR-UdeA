'use strict';

exports.render = (req, res) => {
    // if (req.session.lastVisit) {
    //     //console.log(req.session.lastVisit);
    // }
    // req.session.lastVisit = new Date();

    res.render('index', {
        title: 'Sistema de información de Músicas Regionales',
        user: JSON.stringify(req.user)
    });
};


