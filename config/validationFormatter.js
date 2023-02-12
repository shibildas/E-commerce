const joiErrorFormatter = (rawErrors) =>{
    const errors={}
    const details = rawErrors.details
    details.map(d =>{
        errors[d.path] = [d.message]
    })
    return errors
}

const mongooseErrorFormatter = (rawErrors)=>{
    // return rawErrors
    const errors={}
    const details = rawErrors.errors
    for(const key in details){
        errors[key]= [details[key].message]
        // console.log(errors[key]);
    }
    return errors;

}
module.exports = {joiErrorFormatter, mongooseErrorFormatter }