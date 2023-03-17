module.exports = (app) => {
    const create = async (req, res, next) => {
        try {
            const result = await app.services.account.save(req.body)
            return res.status(201).json(result[0]);
        } catch (err) {
            return next(err)
        }
    }

    const findAll = async (req, res, next) => {
        app.services.account.findAll()
            .then(result => res.status(200).json(result))
            .catch(err => next(err))
    }

    const findById = async (req, res, next) => {
        app.services.account.findById({ id: req.params.id })
            .then(result => res.status(200).json(result))
            .catch(err => next(err))
    }

    const update = async (req, res, next) => {
        app.services.account.update(req.params.id, req.body)
            .then(result => res.status(200).json(result[0]))
            .catch(err => next(err))
    }

    const remove = async (req, res, next) => {
        app.services.account.remove(req.params.id)
            .then(() => res.status(204).send())
            .catch(err => next(err))
    }

    return { create, findAll, findById, update, remove }
}