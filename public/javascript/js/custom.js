

function toggleModal(id,togglewut){
    if(togglewut=='hide'){
        $("#"+id).modal("hide")
        $('.modal-backdrop').remove()
    }else{
        $("#"+id).modal("show")

    }
}



function addToWishList(id){
    let btn_data = $('#'+id+'WishBtn').html()
    $('#'+id+'WishBtn').html('<i class="fa fa-spinner fa-spin"></i>')
    console.log("res");
    $.ajax({
        type: "POST",
        url:  '/wishList/add',
        data: {
            toWish : id
        },
        dataType: "json",
        encode: true,
    }).done(function (res) {
        if(res.success == true){
            Swal.fire(
                'Great!',
                res.message,
                'success'
            )
        }else{
            Swal.fire(
                'Error',
                res.message,
                'error'
              )
        }
        $('#'+id+'WishBtn').html(btn_data)
    })
}

function removeWishList(id){
    let btn_data = $('#'+id+'WishDltBtn').html()
    $('#'+id+'WishDltBtn').html('<i class="fa-solid fa-spinner fa-spin"></i>')
    $.ajax({
        type: "POST",
        url:  '/wishList/remove',
        data: {
            wishid : id
        },
        dataType: "json",
        encode: true,
    }).done(function (res) {
        if(res.success==true){
            Swal.fire(
                'Removed from List! <i class="fa fa-trash-list"></i>',
                res.message,
                'error'
              )
            $('#'+id+'cartWish').remove()
            if(res.data.wishlen  <1){ 
                $('#cartWish').html(`<div class="text-center ">
                <i class="bi bi-bag-heart h1 text-danger my-3 d-block"></i>
                <p class="text-secondary h3"> Your Wishlist is empty!</p>
                <a href="/" class="btn btn-dark btn-sm"><i class="bi bi-bag-plus"></i> Continue Shopping</a>
                </div>`);
            }
        }else{
            Swal.fire(
                'Error',
                res.message,
                'error'
              )
        }
        $('#'+id+'WishDltBtn').html(btn_data)
    })
}



function addToCartLoc(id,qntyId){
    let cartOffCanvas = document.getElementById('cartOffCanvas')
    let bsOffcanvas = new bootstrap.Offcanvas(cartOffCanvas)

    let datatoAdd;
    let readyToUpdate=false;
    let newData = {
        id: id
    }
    if(qntyId){
        newData.qnty = $('#'+qntyId).val()
    }else{
        newData.qnty = 1
    }

    if(localStorage.getItem('cart')){
        let locaData = JSON.parse(localStorage.getItem('cart'))
        let isExit = locaData.reduce((state,val)=>{
            if(val.id==id){
                state=true;
            }
            return state;
        },false)
        if(!isExit){
            locaData.push(newData)
            datatoAdd = locaData;
            readyToUpdate = true;
        }
    }else{
        datatoAdd = [newData]
        readyToUpdate = true;
    }
    if(readyToUpdate){
        data = JSON.stringify(datatoAdd)
        localStorage.setItem('cart', data);
    }
    bsOffcanvas.show() // show after every proccess done!
}


function initEventListenCart(){
    let cartOffCanvas = document.getElementById('cartOffCanvas')
    cartOffCanvas.addEventListener('show.bs.offcanvas', function () {
        getCartData()
    })
}
initEventListenCart();
getCartData();
function getCartData(){
   
        let cartDiv = $('#cartOffCanvaData');
        let cartLoader = $('#cartLoader');
        cartLoader.html('<i class="fa-solid fa-spinner  fa-spin"></i> Loading...')
        let cartVal = localStorage.getItem('cart');
        
        if(cartVal){
            let locaData = JSON.parse(localStorage.getItem('cart'))
            if(locaData.length>0){
                $('#cartCountHeader').show()
                $('#cartCountHeader').html(locaData.length)
            }else{
                $('#cartCountHeader').html(0)
                $('#cartCountHeader').hide()
            }
            
            $.ajax({
                type: "POST",
                url:  '/tocart',
                data: {
                    cart : cartVal
                },
                dataType: "json",
                encode: true,
            }).done(function (res) {
                cartLoader.html('')
                if(res.success==true){
                    cartDiv.html('')
                    let totalPrice= 0;
                    if(res.data.length >=1){

                        
                        res.data.forEach((e,i) => {
                            cartDiv.append(`<div class="border rounded d-flex justify-content-between align-items-center" id="${e.id}main">
                            <img src="/productimages/${e.image}" alt="" class="object-fit-cover" style="width: 100px; height: 100px;">
                            <div>
                                <h6 class="letterLimit-160 pb-0 mb-0">${e.brand}</h6>
                                <p class="m-0 p-0">${e.size}</p>
                                <div class="d-flex align-items-center" style="max-height: 30px;">
                                    <b class="text-success me-2">&#8377;${e.price}</b>
                                    <button class="btn btn-outline-secondary btn-sm mx-2" onclick="cartLupdateQnty('${e.id}',${e.limit},'dec')" id="${e.id}QntyDec">-</button>
                                    <input type="text" class="form-control bg-white text-dark p-0 text-center"  style="width: 35px; height: 30px;" value="${e.qnty}" id="${e.id}QntyInp" disabled>
                                    <button class="btn btn-outline-secondary btn-sm mx-2" onclick="cartLupdateQnty('${e.id}',${e.limit},'inc')" id="${e.id}QntyInc">+</button>
                                </div>
                            </div>
                            <div class="d-flex flex-column">
                                <b class="text-success mx-2 ">&#8377;${e.total}</b>
                                <button class="btn btn-transparent text-muted" onclick="deleteCartL('${e.id}')">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>`)
                        totalPrice += e.total;
                        });
                        const countNm = (res.data.length<=1)? ' item' : ' items';
                        $('#cartItemCount').html(res.data.length + countNm)
                        $('#cartItemTotal').html('&#8377;'+totalPrice)
                        let itemCountCPAGE = document.getElementById('cartItemCount2')
                        if(itemCountCPAGE){
                            itemCountCPAGE.innerHTML = res.data.length;
                            $('#cartSubTotal2').html(totalPrice) 
                            $('#cartTotal2').html(totalPrice)
                        }
                    }else{
                        cartLoader.html(`<p class="text-danger text-center">Add products to the cart to show here!</p>`)
                        const countNm = (res.data.length<=1)? ' item' : ' items';
                        $('#cartItemCount').html(res.data.length + countNm)
                        $('#cartItemTotal').html('&#8377;'+totalPrice)
                        let itemCountCPAGE = document.getElementById('cartItemCount2')
                        if(itemCountCPAGE){
                            itemCountCPAGE.innerHTML = res.data.length;
                            $('#cartSubTotal2').html(totalPrice) 
                            $('#cartTotal2').html(totalPrice)
                        }
                    }
                    
                    
                }else{
                    cartLoader.html(`<p class="text-danger text-center">${res.message}</p>`)

                }
                
            })
        }else{
            $.ajax({
                type: "POST",
                url:  '/tolocal',
                data: {},
                dataType: "json",
                encode: true,
            }).done(function (res) {
                cartLoader.html('')
                if(res.success==true){
                    if (res.data.length >=1) {
                        let newCartDt = res.data.map((val)=>{
                            let data = {
                                id: val.product_id,
                                qnty:val.quantity
                            }
                            return data
                        })
                        let data = JSON.stringify(newCartDt)
                        localStorage.setItem('cart', data);
                    }else{
                        cartLoader.html(`<p class="text-danger text-center">Add products to the cart to show here!</p>`)
                        let itemCountCPAGE = document.getElementById('cartItemCount2')
                        if(itemCountCPAGE){
                            itemCountCPAGE.innerHTML = res.data.length;
                            $('#cartSubTotal2').html(0) 
                            $('#cartTotal2').html(0)
                        }
                    }
                }else{
                    cartLoader.html(`<p class="text-danger text-center">${res.message}</p>`)
                }
            })
        }
 
}

function deleteCartL(id){

    Swal.fire({
        title: 'Are you sure?',
        text: "Are you sure to delete the product from cart!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
            let cartPageItem = document.getElementById(id+'Item');
            let locaData = JSON.parse(localStorage.getItem('cart'))
            locaData = locaData.filter(obj => obj.id !== id)
            locaData = JSON.stringify(locaData)
            localStorage.setItem('cart', locaData);
            getCartData()
            if(cartPageItem){
                cartPageItem.remove();
            }
        }
    })
}
function clearCart(){
    return new Promise((resolve,reject)=>{
        localStorage.setItem('cart', []);
        resolve('success')

    })
}

function cartLupdateQnty(id,limit, calc){
    this.addEventListener('focusout',getCartData);
    let cartPageQ = document.getElementById(id+'CartQnty2');
    let locaData = JSON.parse(localStorage.getItem('cart'))
    let deleteit = false;
    locaData = locaData.map((val,i)=>{
        if(val.id==id){
            if(calc=='inc'){
                if( val.qnty<limit){
                    val.qnty++
                }
            }else if(calc == 'dec'){
                if( val.qnty-1!=0){
                    val.qnty--
                }else{
                    deleteit = true
                }
            }
            if(cartPageQ){
                cartPageQ.innerHTML = val.qnty
                $('#'+id+'cartTotalPrice').html(parseInt($('#'+id+'cartPrice').html())*val.qnty)
            }
            $('#'+id+'QntyInp').val(val.qnty)
        }
        return val
    })

    locaData = JSON.stringify(locaData)
    localStorage.setItem('cart', locaData);
    if(deleteit==true){ // delete after finished proccess!
        deleteCartL(id)
    }
}


