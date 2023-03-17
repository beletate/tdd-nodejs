module.exports = (app) => {
    const create = async (req, res) => {
        try {
            const result = await app.services.account.save(req.body)
            return res.status(201).json(result[0]);
        } catch (err) {
            return res.status(400).json({ error: err.message })
        }
    }

    const findAll = async (req, res) => {
        app.services.account.findAll()
            .then(result => res.status(200).json(result))
    }

    const findById = async (req, res) => {
        app.services.account.findById({ id: req.params.id })
            .then(result => res.status(200).json(result))
    }

    const update = async (req, res) => {
        app.services.account.update(req.params.id, req.body)
            .then(result => res.status(200).json(result[0]))
    }

    const remove = async (req, res) => {
        app.services.account.remove(req.params.id)
            .then(() => res.status(204).send())
    }

    return { create, findAll, findById, update, remove }
}