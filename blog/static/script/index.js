
var React = require('react')
var ReactDOM = require('react-dom')
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var Masonry = require('react-masonry-component');
var masonryOptions = {
    transitionDuration: 0
};
var img_lst = [];
var album_lst = [];
var albums = [];
var album_selected = null;
var album_author = null;
var temp_count = 0;
var img_count = 0 ;
var load = null;

$().ready(function(){

  $(document).mousemove( function(e) {
     $('#trash_follow').css({'top':e.pageY+1.5,'main': e.pageX+1.5})
  });
  $(document).scroll(function () {
    var $el = $('.your_albums');
    var your_bottom = $el.offset().top + $el.outerHeight(true)
    var your_top = $(".your_albums").offset().top;
    var $header = $('.page-header');
    var header_bottom = $header.offset().top + $header.outerHeight(true)
    var $shared = $('.shared_albums');
    var shared_top = $(".shared_albums").offset().top;
    var $shared2 = $('.shared_albums2');
    var shared_top2 = $(".shared_albums2").offset().top;
    console.log(your_bottom)
    console.log(shared_top)
    if ( your_bottom >= shared_top ) {
      $el.css({'position':'absolute','main':'-1.3em','top':shared_top-297})
    }
    if ( your_top > header_bottom-19) {
      $el.css({'position':'fixed','main':'.5em','top':'12em'})
    }
    if ( shared_top < header_bottom-19 ) {
      $shared2.css("visibility", "visible");
      $shared.css("visibility", "collapse");
      // css({'position':'fixed','main':'1.9vw','top':'11.9em'})
    }
    if ( $shared2.is(":visible") && shared_top >= shared_top2 ) {
      $shared2.css("visibility", "collapse");
      $shared.css("visibility", "visible");
    }
  });
// Set up CSRF TOKEN for Ajax requests
      function getCookie(name)
    {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?

                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    $.ajaxSetup({
         beforeSend: function(xhr, settings) {
             if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                 // Only send the token to relative URLs i.e. locally.
                 xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
             }
         }
    });

})


function Load (selected,author,images,user_albums,contr_albums) {
  this.album_selected = selected;
  this.album_author = author;
  this.images = images;
  this.user_albums = user_albums;
  this.contr_albums = contr_albums;

  this.updateImages = function(images){
    this.images = images
  },

  this.updateSelected = function(selected,author) {
      this.album_selected = selected;
      this.album_author = author;
  },

  this.listenForDrop = function() {

      if (window.FileReader) {
          var drop;
              drop = document.getElementById('main');
              function cancel(e) {
                  if (e.preventDefault) {
                      e.preventDefault();
                  }
                  return false;
              }
              try {
                  addEventHandler(window, 'dragover', cancel);
                  addEventHandler(window, 'dragenter', cancel);
                  addEventHandler(window, 'drop',(e) => {
                  e = e || window.event;
                  if (e.preventDefault) {
                      e.preventDefault();
                  }
                  var dt = e.dataTransfer;
                  var files = dt.files;
                  temp_count += files.length;
                  var temp_img_updated = update_temp_img(load.images,files.length);
                  load.images.length = 0;
                  temp_img_updated.map((x) => {
                    x.images.map((y) => {
                      load.images.push(y);
                    })
                  })

                  for (var i = 0; i < files.length; i++) {
                      var file = files[i];
                      var reader = new FileReader();
                      var mime_type= files[i].type;
                      reader.readAsDataURL(file);
                      addEventHandler(reader, 'loadend', function (e, file) {
                          var bin = this.result;

                          if(document.getElementById('imgur_check').checked) {
                              uploadImg(bin,load.album_selected,load.album_author,mime_type);
                          } else {
                              uploadImgur(bin,load.album_selected,load.album_author,mime_type);
                          }

                      }.bindToEventHandler(file));

                  }
                  remount_left(load.album_selected,load.album_author,temp_img_updated,load.user_albums,load.contr_albums);
                  return false;
              })

              Function.prototype.bindToEventHandler = function bindToEventHandler() {
                  var handler = this;
                  var boundParameters = Array.prototype.slice.call(arguments);
                  //create closure
                  return function (e) {
                      e = e || window.event; // get window.event if e argument missing (in IE)
                      boundParameters.unshift(e);
                      handler.apply(this, boundParameters);
                  };
              }
            } catch(x) {
            }
      } else {
          document.getElementById('status').innerHTML = 'Your browser does not support the HTML5 FileReader.';
      }
  },

  this.forgetDrop = function(){

  }



}

var New_Album = React.createClass({
    componentDidMount: function() {
      var submit = document.getElementById('submit')
      addEventHandler(submit, 'click', this.submitNewAlbum);
    },

    submitNewAlbum: function () {
        var album_name = document.getElementById('name').value;
        var users = document.getElementById('users').value;
        if (album_name !== "") {
            if(users === "") {
              users = "none"
            }
            var result = { 'album_name': album_name , 'users' :users };
            result = JSON.stringify(result);
            $.ajax({
                url: "/new/album",
                method: "POST",
                data: result
            }).done(function (data) {

            }).error(function (err) {
                console.log(err);

            });
        }
    },

    render: function() {
    return <div className="new_album" key={1} >
    <img className='create_album' src="http://i.imgur.com/YCWwQmm.png"/>
    <br />
    <form className="new_album_form">

    <p className="name">
      <label for="name">Name</label>
      <br />
      <input type="text" name="name" id="name" maxLength="20" />
    </p>

    <p className="users">
      <label for="users">Other Users</label>
      <br />
      <input type="text" name="users" id="users" />
    </p>
    <br />
    <p className="submit" id="submit">
      <input type="submit" value="Save" />
    </p>

    </form>
    </div>
  }

})


var Album_Container = React.createClass({
  updateSelectedImg: function(source,author) {
    this.setState({
      album_selected: source
    })
  },

  getInitialState: function() {
      return {
          delete_album: false,
          user_albums:this.props.user_albums,
          contr_albums:this.props.contr_albums,
          album_selected: null,
          current_user: this.props.current_user,
          key_code: null,
          class_name: null
      }
  },

keyDown: function(event){

  try{
    switch(event.keyCode) {
      case 16:
        this.setState({
          key_code:event.keyCode
        })
        break;
      case 27:
      document.getElementById("trash_follow").style.visibility ='hidden';
      document.body.style.cursor = "default";
        document.getElementById("trash").style.visibility ='visible';


        this.setState({
          delete_album: false
        })
        break;
    }
  }catch(x) {}
},

keyUp:function(event){
  if(this.state.key_code === 16) {
    try {
      this.setState({
        key_code: null
      });
    } catch (x) {}
  }
},

  deleteAlbum: function() {
    if (this.state.album_selected === null) {
      document.getElementById("trash").style.visibility ='collapse';
      document.getElementById("trash_follow").style.visibility ='visible';
      document.body.style.cursor = "none";
      this.setState({
        delete_album: true
      })
    }else {
      delete_album(this.state.album_selected)
    }
  },

  componentDidMount: function() {
    window.addEventListener("keydown", this.keyDown, false);
    window.addEventListener("keyup", this.keyUp, false);
    document.getElementById('trash').addEventListener('click', this.deleteAlbum, false);

  },

  componentWillUnmount: function() {
    document.getElementById('trash').removeEventListener('click', this.deleteAlbum, false);
  },


  mouseDownHandler: function () {
    document.getElementById("trash_follow").style.visibility ='hidden';
    document.body.style.cursor = "default";
    document.getElementById("trash").style.visibility ='visible';
  },

  render: function() {
    window.scrollTo(0, 0);
    return <Masonry
                className={'wrapper'} // default ''
                elementType={'div'} // default 'div'
                options={masonryOptions} // default {}
                disableImagesLoaded={false} // default false
            >


            <div className="pin-leave">
            <div className="what">
              <img src="http://cssdeck.com/uploads/media/items/2/2v3VhAp.png" />
              <div className="circle1"></div>
              <div className="circle2"></div>
              <div className="circle3"></div>
              <div className="title_cont"><p>Pictures</p></div>
            </div>
            <img src="http://cssdeck.com/uploads/media/items/2/2v3VhAp.png" />

            </div>


    <div className="pin-leave">
      <img src="http://cssdeck.com/uploads/media/items/2/2v3VhAp.png" />
    </div>

    <div className="pin-leave">
    <div className="what">
      <img src="http://i.imgur.com/wFpjb8w.jpg" />
      <div className="circle1"></div>
      <div className="circle2"></div>
      <div className="circle3"></div>
      <div className="title_cont"><p>Pictures</p></div>
    </div>
    <img src="http://i.imgur.com/wFpjb8w.jpg" />

    </div>

    <div className="pin-leave">
      <img src="http://i.imgur.com/wFpjb8w.jpg" />

    </div>

    <div className="pin-leave">
      <img src="https://s3-us-west-2.amazonaws.com/cloudimgs/66d0465c" />

    </div>

    <div className="pin-leave">
      <img src="http://i.imgur.com/jGk5KTZ.png" />

    </div>
    <div className="pin-leave">
      <img src="https://s3-us-west-2.amazonaws.com/cloudimgs/1567250e" />

    </div>

    <div className="pin-leave">
      <img src="http://cssdeck.com/uploads/media/items/2/2v3VhAp.png" />

    </div>

    <div className="pin-leave">
      <img src="https://s3-us-west-2.amazonaws.com/cloudimgs/e42ff0fd" />

    </div>

    <div className="pin-leave">
      <img src="http://i.imgur.com/wFpjb8w.jpg" />

    </div>



      </Masonry>


      }
});

var Album_Row = React.createClass({

  render: function() {
      try {
        var row = this.props.row;
        return  <tr id = {"row" + this.props.row} key = {this.props.row}>
                  {
                    this.props.images[row].albums.map((x) => {
                      var img_urls = x.urls
                      var album_cover = img_urls[0];
                      var album_name = x.name;
                      var album_author = x.author;
                      if (album_name === this.props.album_selected) {
                          return <td>
                                  <Album_IMG contr_albums = {this.props.contr_albums} user_albums = {this.props.user_albums}  delete_album={this.props.delete_album} select_source_method={this.props.select_source_method} current_user = {this.props.current_user} key_code = {this.props.key_code}  album_author = {album_author} album_name = {album_name} class_name = {"col-sm album_img selected"} urls = {img_urls} img_source = {album_cover} />
                                </td>
                      }else {
                        return <td>
                                <Album_IMG contr_albums = {this.props.contr_albums} user_albums = {this.props.user_albums} delete_album={this.props.delete_album} select_source_method={this.props.select_source_method} current_user = {this.props.current_user} key_code = {this.props.key_code}  album_author = {album_author} album_name = {album_name} class_name = {"col-sm album_img"} urls = {img_urls} img_source = {album_cover} />
                              </td>
                      }
                    })
                  }
                </tr>
      }catch(x) {
          return  <tr id = {"row" + this.props.row} key = {this.props.row}>
                  </tr>
      }
  }
});

var Album_IMG = React.createClass({
  getInitialState: function() {
    return {
      delete_album: this.props.delete_album,
      hidden: 'hidden',
      album_author: this.props.album_author,
      album_name: this.props.album_name,
      img_source: this.props.img_source,
      class_name: this.props.class_name,
      urls: this.props.urls,
      select_source_method: this.props.select_source_method,
      key_code: this.props.key_code,
      current_user: this.props.current_user
    };
  },

  onMouseEnterHandler: function() {

  },
  onMouseLeaveHandler: function() {

  },

  onMouseDownHandler: function() {
    if (this.props.delete_album) {
      delete_album(this.state.album_name)
      document.getElementById("trash").style.visibility ='visible';
      document.getElementById("trash_follow").style.visibility ='collapse';
      document.body.style.cursor = "default";
    }else {
      if(this.props.key_code === 16 && this.state.album_author === this.props.current_user) {
        this.state.select_source_method(this.state.album_name)
      }else {
        album_selected = this.state.album_name;
        album_author = this.state.album_author;
        if (load === null) {
          load = new Load(this.state.album_name,this.state.album_author,this.state.urls,this.props.user_albums,this.props.contr_albums)
          load.listenForDrop();
        }else {
          load.updateImages(this.state.urls)
          load.updateSelected(this.state.album_name,this.state.album_author)
        }
        var img_urls = update_img_list(this.state.urls);
        remount_left(this.state.album_name,this.state.album_author,img_urls,this.props.user_albums,this.props.contr_albums);

      }
    }
  },

  render: function() {
    if (this.props.album_name.length > 10) {
      var album_title_box = "album_title2";
      var img_size = this.props.class_name + " smaller";
    }else {
      var album_title_box = "album_title";
      var img_size = this.props.class_name;
    }
    var divStyle = {
        backgroundImage: 'url(' + this.props.img_source + ')'
    };

      return  <div>
                <div className={album_title_box}><p>{this.props.album_name}</p></div>
                <div onMouseDown={this.onMouseDownHandler} onMouseEnter={this.onMouseEnterHandler} onMouseLeave={this.onMouseLeaveHandler} className={img_size} id={"img_" + this.props.img_number} style={divStyle}>
                </div>
              </div>
  }
});

var Min_Container = React.createClass({
  updateSelectedImg: function(source) {
      this.setState({ select_source: source,
                      main_img: source[source.length-1]
                    });
  },

  updateMainImg: function(img) {
    this.setState({
      main_img: img
    })
  },

  getInitialState: function() {
      return {
          main_img: this.props.images[0].images[0],
          user_albums: this.props.user_albums,
          contr_albums: this.props.contr_albums,
          images: this.props.images,
          select_source: [this.props.images[0].images[0]],
          album_selected: this.props.album_selected,
          album_author: this.props.album_author,
          current_user: this.props.current_user,
          key_code: null
      }
  },

  keyDown: function(event){
    this.setState({
    key_code:event.keyCode
    })
    var elem = document.getElementById("main_img_container");
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }

  },

  keyUp:function(event){
    // this.setState({
    //   key_code:null
    // })
  },

  backAlbums: function () {
    album_lst.length = 0;
    img_lst.length = 0;
    load.forgetDrop()
    load = null;
    ReactDOM.unmountComponentAtNode(document.getElementById('main'));
    ReactDOM.render(React.createElement(Album_Container,{user_albums:this.props.user_albums,contr_albums:this.props.contr_albums}), document.getElementById('main'));
  },

  nextImg: function () {
    alert("confused")
    var current_index = album_lst.indexOf(this.state.main_img);
    var new_img = "";
    if (current_index !== album_lst.length - 1) {
      new_img = album_lst[current_index+1]
    } else {
      new_img = album_lst[0]
    }
    this.updateMainImg(new_img);
  },

  previousImg: function () {
    var current_index = album_lst.indexOf(this.state.main_img);
    var new_img = "";
    if (current_index > 0) {
      new_img = album_lst[current_index-1]
    } else if (current_index === 0 && album_lst.length === 1) {
    } else {
      new_img = album_lst[album_lst.length - 1]
    }
    this.updateMainImg(new_img);
  },

  render: function() {
    return    <div id="table" className="table_holder">
                <Rotate_IMG  key={Math.random()*20} img_source = {this.state.main_img} nextImg = {this.nextImg} previousImg = {this.previousImg} />
                <div className="album_name_holder">
                  <div className="back_albums" id="back_albums">
                  </div>
                  <p className="album_name">{this.props.album_selected}</p>
                </div>
                <table id="main_table" className="main_table">
                    <tbody>
                      {
                        this.props.images.map((src, i) => {
                          return <Row images = {this.props.images[i]} key_code = {this.state.key_code} current_user = {this.state.current_user} album_author = {this.props.album_author} album_selected = {this.props.album_selected} select_source={this.state.select_source} select_source_method={this.updateSelectedImg} row={i} key={i} />
                        }).map(function(src){
                            return src
                        })
                      }
                    </tbody>
                  </table>
                  <div id = "drop_here">DROP IMAGE FILES HERE</div>
              </div>
  },

  getUserInfo: function() {
    $.ajax({
        url: "/get/user",
        method: "GET",
        data: {}
    }).done((data) => {
        var user_info = JSON.parse(data);
        this.setState({
          current_user: user_info
        })
    }).error(function (err) {
        console.log(err);
    });
  },

  deleteImgs: function() {
          delete_url(img_lst,this.state.album_selected)
  },

  componentDidMount: function() {
    window.addEventListener("keydown", this.keyDown, false);
    window.addEventListener("keyup", this.keyUp, false);
    document.getElementById('trash').addEventListener('click', this.deleteImgs, false);
    document.getElementById('back_albums').addEventListener('click', this.backAlbums, false);
    ReactDOM.render(React.createElement(Rotate_IMG, { img_source: album_lst[0] }), document.getElementById('right'));

  },
  componentWillUnmount: function() {
    document.getElementById('trash').removeEventListener('click', this.deleteImgs, false);
    document.getElementById('back_albums').removeEventListener('click', this.backAlbums, false);
  },
  componentWillMount: function() {
    this.getUserInfo();
  }
});

var Row = React.createClass({

  getInitialState: function() {
    return {
      select_source_method: this.props.select_source_method,
      select_source: this.props.select_source,
      album_author: this.props.album_author,
      }
  },

  render: function() {
    var row = this.props.row;
      return  <tr id={"row"+this.props.row} key={this.props.row}>
              {
              this.props.images.images.map((src, i) => {
                album_lst.push(src);

                var ran = (Math.floor(Math.random() * (9999 - 1)) + 1)
                var selected = false;
                for(var x = 0; x < this.props.select_source.length; x++) {
                  if (this.props.select_source[x] === src) {
                    selected = true;
                  }
                }
                if (selected) {
                  return <td key={ran}>
                          <View_IMG key_code={this.props.key_code} current_user={this.props.current_user} album_author={this.props.album_author} album_selected={this.props.album_selected} select_source_method={this.props.select_source_method} class_name={"col-sm selected"} img_number={i} img_source={src} />
                         </td>
                } else {
                  return <td key={ran}>
                          <View_IMG key_code={this.props.key_code} current_user={this.props.current_user} album_author={this.props.album_author} album_selected={this.props.album_selected} select_source_method={this.props.select_source_method} class_name={"col-sm"} img_number={i} img_source={src} />
                        </td>
                  }
                })
              }
              </tr>
    }
});

var View_IMG = React.createClass({
    getInitialState: function() {
        return {
            current_user: this.props.current_user,
            album_selected: this.props.album_selected,
            album_author: this.props.album_author,
            hidden: 'hidden',
            select_source_method: this.props.select_source_method,
            img_source: this.props.img_source,
            img_number: this.props.img_number,
            class_name: this.props.class_name,
            key_code: this.props.key_code

        };
    },

    onMouseEnterHandler: function() {
        if (this.state.album_author === this.state.current_user) {
            this.setState({
            hidden:'show'
            })
        }
    },


    onMouseLeaveHandler: function() {
        this.setState({
          hidden:'hidden'
        })
    },

    deleteImg: function() {
      var lst = [];
      lst.push(this.state.img_source)
        delete_url(lst,this.state.album_selected);
    },

    onMouseDownHandler: function() {

        if(this.state.key_code === 16) {
            var exists = img_lst.filter((x) => {
                return(x === this.state.img_source)
            })
            if (exists.length === 0) {
                img_lst.push(this.state.img_source);
            }
        }else {
            img_lst.length = 0;
            img_lst.push(this.state.img_source)
        }
          this.state.select_source_method(img_lst);
    },

    render: function() {
      var divStyle = {
          backgroundImage: 'url(' + this.props.img_source + ')'
      };
        return  <div draggable="true" onMouseDown={this.onMouseDownHandler} onMouseEnter={this.onMouseEnterHandler} onMouseLeave={this.onMouseLeaveHandler} className={this.props.class_name} id={"img_" + this.props.img_number} style={divStyle}>
                <div className={"delete_img "+this.state.hidden} onMouseDown={this.deleteImg}></div>
                </div>
    }
});

var Rotate_IMG = React.createClass({
    getInitialState: function() {
        return {
            source: this.props.img_source,
            nextImg: this.props.nextImg,
            previousImg: this.props.previousImg,
            full_screen: false
        }
    },

    nextImg: function() {
      if ( window.innerHeight == screen.height) {
        var current_index = album_lst.indexOf(this.state.source);
        var new_img = "";
        if (current_index !== album_lst.length - 1) {
          new_img = album_lst[current_index+1];
        } else {
          new_img = album_lst[0];
        }
        this.setState({
          source: new_img
        })
      } else {

        this.state.nextImg();
      }
    },

    previousImg: function() {
      if ( window.innerHeight == screen.height) {
        alert("YES")
        var current_index = album_lst.indexOf(this.state.source);
        var new_img = "";
        if (current_index > 0) {
          new_img = album_lst[current_index-1];
        } else if (current_index === 0 && album_lst.length === 1) {
        } else {
          new_img = album_lst[album_lst.length - 1];
        }
        this.setState({
          source: new_img
        })
      } else {
        this.state.previousImg();
      }

    },

    componentDidMount: function() {
    },

    onMouseDownHandler: function() {

    },

    rotate_images: function() {
        var index = img_lst.indexOf(this.state.source);
        if (index !== img_lst.length - 1) {
            index += 1;
            this.setState({ source: img_lst[index] });
        } else {
            this.setState({ source: img_lst[0] });
        }
    },

    render:  function() {

        var divStyle = {
            backgroundImage: 'url(' + this.state.source + ')'
        };
        return <div style={divStyle} id="main_img_container" onMouseDown = {this.onMouseDownHandler} className={"main_img_container"}>
                <Next_IMG_Button nextImg = {this.nextImg}  />
                <Previous_IMG_Button previousImg = {this.previousImg} />

              </div>
    }
});

// var Full_Screen_Button = React.createClass ({
//
// })

var Next_IMG_Button = React.createClass ({
  getInitialState: function () {
    return {
      nextImg: this.props.nextImg
    }

  },

  onMouseDownHandler: function () {
    this.state.nextImg()
  },

  render: function () {
    return <div onMouseDown = {this.onMouseDownHandler} id="main_img_right_arrow" className="main_img_right_arrow"></div>
  }
})

var Previous_IMG_Button = React.createClass ({
  getInitialState: function () {
    return {
      previousImg: this.props.previousImg
    }
  },
  onMouseDownHandler: function () {
    this.state.previousImg()
  },
  render: function () {
    return <div onMouseDown = {this.onMouseDownHandler} id="main_img_left_arrow" className="main_img_left_arrow"></div>
  }
})

function update_album_list(res) {
  var user_album_images = [{albums: []}];
  var contr_album_images = [{albums: []}];
    res.user_albums.map((x) => {
      if (user_album_images[user_album_images.length - 1].albums.length < 4) {
          user_album_images[user_album_images.length - 1].albums.push(x);
      } else {
          user_album_images.push({ albums: [x]});
      }
    })
    res.contr_albums.map((x) => {
      if (contr_album_images[contr_album_images.length - 1].albums.length < 4) {
          contr_album_images[contr_album_images.length - 1].albums.push(x);
      } else {
          contr_album_images.push({ albums: [x]});
      }
    })
  return [user_album_images,contr_album_images]
};



function get_albums(res) {
    $.ajax({
        url: "/get/",
        method: "GET",
        data: {}
    }).done(function (data) {
        albums = JSON.parse(data);
        var user_albums = update_album_list(albums.album_url_list);
        var contr_albums = user_albums[1];
        user_albums = user_albums[0];
        ReactDOM.render(React.createElement(Album_Container, {current_user:albums.user, user_albums:user_albums, contr_albums:contr_albums}) , document.getElementById('main'));



    }).error(function (err) {
        console.log(err);
    });
}

function filter_row(image_list, row) {
    return image_list.map((src) => {
        if (src.row === row) {
            return src.images;
        }
    }).filter(function (x) {
        return (typeof x !== 'undefined')
    })
};

var File_Input = React.createClass({
        onChangeHandler: function(event) {
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function (event) {
            uploadImgur(event.target.result);
        };
        reader.readAsDataURL(file);
    },

    render: function() {
        return  <input onChange={this.onChangeHandler} type={"file"} />

    }
});


function update_temp_img(images,number_of_images) {
  var loading = 'http://i.imgur.com/JzVkr04.gif'
  var img_lst = update_img_list(images)
  for(var x = 0; x < number_of_images; x++) {
    if (img_lst[img_lst.length - 1].images.length < 4) {
        img_lst[img_lst.length - 1].images.push(loading);
    } else {
        img_lst.push({ images: [loading], row: img_lst.length });
    }
  }

  return img_lst
}

function replace_temp_img(res) {
    var loading = 'http://i.imgur.com/JzVkr04.gif'
    for(var y = 0; y < images.length; y++) {
        var done = false;
        for(var z = 0; z < images[y].images.length; z++) {
            if (images[y].images[z] === loading) {
                images[y].images[z] = res
                done = true;
                break;
            }
        }
        if (done) {
            break;
        }
    }
}

function update_img_list(res) {
  var images = [{images: [], row: 0 }]

  res.map((x) => {
    if (images[images.length - 1].images.length < 4) {
        images[images.length - 1].images.push(x);
    } else {
        images.push({ images: [x], row: images.length });
    }
  })
  return images
}

function remount_left(album_name, album_author, images,user_albums,contr_albums) {
    ReactDOM.unmountComponentAtNode(document.getElementById('main'));
    ReactDOM.render(React.createElement(Min_Container, {user_albums: user_albums, contr_albums: contr_albums, images: images, album_author: album_author, album_selected: album_name}), document.getElementById('main'));
    window.scrollTo(0, 0);
}


try {
    ReactDOM.render(React.createElement(File_Input), document.getElementById('upload'));
} catch (err) {

}

// window.onbeforeunload = function (e) {
//     return 'Please press the Logout button to logout.';
// };
function uploadImg(base64,album,author,mime_type) {
    var base64 = base64.replace(/^.*base64,/, '');

    $.ajax({
        method: 'POST',
        url: '/upload/s3/',
        data: {
            csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken').value,
            image: base64, // base64 string, not a data URI
            mime_type: mime_type
        }
    }).done((res) => {
        var result = JSON.parse(res);
        var url = result.url;
        // replace_temp_img(link);
        update_server_url(url,album,author);

        // saveFile(link);
    }).error(function (err) {
        console.log(err);
    });
}

function uploadImgur(base64,album,author) {
    var base64 = base64.replace(/^.*base64,/, '');

    $.ajax({
        method: 'POST',
        url: 'https://api.imgur.com/3/image',
        headers: {
            Authorization: 'Client-ID 4d075e399079cdc'
        },
        data: {

            image: base64
        }
    }).done((res) => {
        var link = res.data.link;
        update_server_url(link,album,author);
    }).error(function (err) {
        console.log(err);
    });
}

function update_server_url(url,album,author) {
    var result = { 'url': url, 'album':album, 'author':author };
    result = JSON.stringify(result);
    $.ajax({
        url: "/save/",
        method: "POST",
        data: result
    }).done(function (data) {
      temp_count -= 1;

      var result = JSON.parse(data);
      var img_result = result.images;
      for(var x = 0; x < temp_count; x++ ) {
          img_result.push('http://i.imgur.com/JzVkr04.gif')
      }
      var user_albums = update_album_list(result.albums);
      var contr_albums = user_albums[1];
      user_albums = user_albums[0];
      var img_urls = update_img_list(img_result);
      remount_left(result.album,result.author,img_urls,user_albums,contr_albums)

      if(temp_count === 0) {

        load.updateImages(result.images)
        load.updateSelected(album_selected,album_author)
      }
    }).error(function (err) {
        console.log(err);

    });
}

function delete_url(res,album) {

    var result = { 'url': res, 'album': album };
    result = JSON.stringify(result);
    $.ajax({
        url: "/delete/",
        method: "POST",
        data: result
    }).done(function (data) {

        img_lst.length = 0;
        albums.length = 0;
        img_lst = [];
        albums = [];
        get_albums();
    }).error(function (err) {
        console.log(err);
    });
}

function delete_album(album) {
    var result = {'album': album };
    result = JSON.stringify(result);
    $.ajax({
        url: "/delete/album",
        method: "POST",
        data: result
    }).done(function (data) {
        var albums = JSON.parse(data);
        var user_albums = update_album_list(albums);
        var contr_albums = user_albums[1];
        user_albums = user_albums[0];
        ReactDOM.unmountComponentAtNode(document.getElementById('main'));
        ReactDOM.render(React.createElement(Album_Container,{user_albums:user_albums,contr_albums:contr_albums}), document.getElementById('main'));
    }).error(function (err) {
        console.log(err);
    });
}

function addEventHandler(obj, evt, handler) {
    if (obj.addEventListener) {
        // W3C method
        obj.addEventListener(evt, handler, false);
    } else if (obj.attachEvent) {
        // IE method.
        obj.attachEvent('on' + evt, handler);
    } else {
        // Old school method.
        obj['on' + evt] = handler;
    }
}
function main() {
  try {
    get_albums()
  }catch(x) {
  }
  addEventHandler(document.getElementById('page-header-color'),'change',function(){
      var value = document.getElementById('page-header-color').value;
      document.getElementById('page-header').style.backgroundColor = "#"+value;
  })


}

main();
