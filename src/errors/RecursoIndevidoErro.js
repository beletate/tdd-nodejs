module.exports = function RecursoIndevidoErro(message = 'Este recurso não pertence ao usuário.') {
    this.name = 'RecursoIndevidoErro';
    this.message = message;
}