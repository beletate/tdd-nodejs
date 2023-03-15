module.exports = (app) => {
    const create = async(req, res) => {
        app.services.account.save(req.body)
            .then((result) => {
                return res.status(201).json(result[0]);
            })
    }

    const findAll = async(req, res) => {
        app.services.account.findAll()
            .then(result => res.status(200).json(result))
    }

    const findById = async(req, res) => {
        app.services.account.findById({id: req.params.id})
            .then(result => res.status(200).json(result))
    }

    return { create, findAll, findById }
}