const express = require('express');
const RecursoIndevidoErro = require('../errors/RecursoIndevidoErro');

module.exports = (app) => {
    const router = express.Router();


    router.param('id', (req, res, next) => {
        app.services.account.findById({id: req.params.id})
            .then((acc) => {
                if(acc.user_id !== req.user.id){
                    throw new RecursoIndevidoErro();
                } else {
                    next();
                }
            })
            .catch(err => next(err)) 
    })

    router.post('/', async (req, res, next) => {
        try {
            const result = await app.services.account.save({...req.body, user_id: req.user.id})
            return res.status(201).json(result[0]);
        } catch (err) {
            return next(err)
        }
    })

    router.get('/', async (req, res, next) => {
        app.services.account.findAll(req.user.id)
            .then(result => res.status(200).json(result))
            .catch(err => next(err))
    })

    router.get('/:id', async (req, res, next) => {
        app.services.account.findById({ id: req.params.id })
            .then(result => res.status(200).json(result))
            .catch(err => next(err))
    })

    router.put('/:id', async (req, res, next) => {
        app.services.account.update(req.params.id, req.body)
            .then(result => res.status(200).json(result[0]))
            .catch(err => next(err))
    })

    router.delete('/:id', async (req, res, next) => {
        app.services.account.remove(req.params.id)
            .then(() => res.status(204).send())
            .catch(err => next(err))
    })

    return router
}