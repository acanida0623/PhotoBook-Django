
var Radium = require('radium');
var React = require('react')
var ReactDOM = require('react-dom')
var Masonry = require('react-masonry-component');
var masonryOptions = {
    transitionDuration: 1000
};
var img_lst = [];
var album_lst = [];
var albums = [];
var album_selected = null;
var album_author = null;
var temp_count = 0;
var img_count = 0 ;
var load = null;
var loadimage = new Image();
loadimage.src="http://i.imgur.com/Gljcgpk.gif"
import {StyleRoot} from 'radium';
var Select = require('react-select');

$().ready(function(){
  $('#new_user_profile_picture_url').on('keyup',()=>{
    var $url = $('#new_user_profile_picture_url').val();
    $('#new_user_profile_picture').css("background-size", "cover");
    $('#new_user_profile_picture').css("background-image", "url("+$url+")");
  })
  $('#new_user_get_profile_picture').on('change',(event)=>{
    var current_url = $('#new_user_get_profile_picture').val()
    if(current_url !== "") {
      $('#new_user_profile_picture').css("background-size", "15% 15%");
      $('#new_user_profile_picture').css("background-image", "url(http://i.imgur.com/Gljcgpk.gif)");
    }
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
        uploadProfileImage(event.target.result);
    };
    reader.readAsDataURL(file);
  })
  $(document).mousemove( function(e) {
     $('#trash_follow').css({'top':e.pageY+1.5,'main': e.pageX+1.5})
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
              drop = document.getElementById('upload_drop_zone');
              function cancel(e) {
                  if (e.preventDefault) {
                      e.preventDefault();
                  }
                  return false;
              }
              try {
                  addEventHandler(drop, 'dragover', cancel);
                  addEventHandler(drop, 'dragenter', cancel);
                  addEventHandler(drop, 'drop',(e) => {
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
                      load.images.push(x);

                  })

                  for (var i = 0; i < files.length; i++) {
                      var file = files[i];
                      var reader = new FileReader();
                      var mime_type= files[i].type;
                      reader.readAsDataURL(file);
                      addEventHandler(reader, 'loadend', function (e, file) {
                          var bin = this.result;

                          // if(document.getElementById('imgur_check').checked) {
                          //     uploadImg(bin,load.album_selected,load.album_author,mime_type);
                          // } else {
                              uploadImgur(bin,load.album_selected,load.album_author,mime_type);
                          // }

                      }.bindToEventHandler(file));

                  }
                  remount_left(load.album_selected,load.album_author,temp_img_updated,load.user_albums,load.contr_albums,author);
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

var new_album_friends_selected = [];
var new_album_height;
var New_Album = React.createClass({
    getInitialState: function () {
      return {
        selected_friends:[]
      }

    },
    submitNewAlbum: function () {
        var album_name = document.getElementById('name').value;
        var users = new_album_friends_selected;
        if (album_name !== "") {
            var result = { 'album_name': album_name , 'users' : users };
            result = JSON.stringify(result);
            $.ajax({
                url: "/new/album",
                method: "POST",
                data: {result,
                       csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken').value
                      }
            }).done(function (data) {
              window.location.href = "/";
            }).error(function (err) {
                console.log(err);
            });
        }
    },

    friendsChange:function(event){
      new_album_friends_selected = event.split(",");
      alert(new_album_friends_selected.length)
      new_album_height =  20 + (new_album_friends_selected.length/1.1) +'em'
      $('.new_album_form').css('height',new_album_height);
    },

    render: function() {
    return <div className="new_album" >
            <Header friends_options = {this.props.friends_options} current_user = {this.props.current_user} user_albums = {this.props.user_albums} contr_albums = {this.props.contr_albums} />
            <form className="new_album_form">
              <span id="create_album_text">
              Create New Album
              </span>
              <span id="create_album_name_text">
                Name
              </span>
              <input type="text" name="name" className="name" id="name" maxLength="20" />
              <span id="create_album_users_text">
                Users
              </span>
              <div className="friends_select">
              <Select
                  joinValues={true}
                  name="users"
                  options={[{value:'Andrew', label:'Andrew'},
                {value:'Andrew', label:'Andrew'},
                {value:'Andrew2', label:'Andrew2'},
                {value:'Andrew3', label:'Andrew3'},
                {value:'Andrew4', label:'Andrew4'},
                {value:'Andrew5', label:'Andrew5'},
                {value:'Andrew6', label:'Andrew6'},
                {value:'Andrew7', label:'Andrew7'},
                {value:'Andrew8', label:'Andrew8'},
                {value:'Andrew9', label:'Andrew9'},
                {value:'Andrew10', label:'Andrew10'},
                {value:'Andrew11', label:'Andrew11'},
                {value:'Andrew12', label:'Andrew12'},
                {value:'Andrew13', label:'Andrew13'},
                {value:'Andrew14', label:'Andrew14'},
                {value:'Andrew15', label:'Andrew15'},
                {value:'Andrew16', label:'Andrew16'},
                {value:'Andrew17', label:'Andrew17'},
                {value:'Andrew18', label:'Andrew18'},
                {value:'Andrew19', label:'Andrew19'},
                {value:'Andrew20', label:'Andrew20'},
                {value:'Andrew21', label:'Andrew21'},
                {value:'Andrew22', label:'Andrew22'}]}
                  multi={true}
                  onChange={this.friendsChange}
              />
              </div>
              <button  onMouseDown = {this.submitNewAlbum} type="submit">Save</button>
            </form>
          </div>

  }
})

var Header = React.createClass({
  getInitialState: function() {
    return {
      backAlbums:this.props.backAlbums,
      user_albums:this.props.user_albums,
      contr_albums:this.props.contr_albums,
      current_user:this.props.current_user,
      friends_options:this.props.friends_options
    }

  },

  backAlbums: function () {
    album_lst.length = 0;
    img_lst.length = 0;
    ReactDOM.unmountComponentAtNode(document.getElementById('main'));
    ReactDOM.render(React.createElement(Album_Container,{current_user:this.state.current_user, user_albums:this.props.user_albums, contr_albums:this.props.contr_albums}), document.getElementById('main'));
  },

  createAlbum: function () {
    ReactDOM.unmountComponentAtNode(document.getElementById('main'));
    ReactDOM.render(React.createElement(New_Album,{friends_options:this.props.friends_options,current_user:this.state.current_user, user_albums:this.state.user_albums,contr_albums:this.state.contr_albums}), document.getElementById('main'));
  },

  uploadNew: function () {

  },

  render: function() {
    if (this.props.authenticated) {
      return <div className="page-header" id="page-header" >
      <div className="top-menu">

        <div onMouseDown={this.backAlbums} id="back_albums">
          <span>
            Albums
          </span>
        </div>

        <div onMouseDown={this.createAlbum} id="create_new_album">
          <span>
            New Album
        </span>
        </div>


        <label className="switch">
          <input id="imgur_check" type="checkbox" />
          <div className="slider round"></div>
        </label>
        <span id="hello_user">Hello {this.props.user_name}(<a href='/accounts/logout/'>Log out</a>)</span>
      </div>
      </div>
    }else {
      return <div className="page-header" id="page-header" >
      <div id="logo">
      </div>
      <div className="top-menu">
        <div onMouseDown={this.viewFriends} id="friends">
          <p>
            Friends
          </p>
        </div>

        <div onMouseDown={this.backAlbums} id="back_albums">
          <p>
            Albums
          </p>
        </div>

        <div onMouseDown={this.createAlbum} id="create_new_album">
          <p>
            New Album
        </p>
        </div>


        <User_Commands user_name={this.props.current_user}/>

        <label className="switch">
          <input id="imgur_check" type="checkbox" />
          <div className="slider round"></div>
        </label>

      </div>
    </div>
    }


  }
})

var User_Commands = React.createClass({
  getInitialState: function () {
    return {
          selected:false,
          logout_style: {cursor: "pointer", background: "#000000"},
          main_style: {}
    }
  },

  mainOver: function () {
      this.setState({
        selected:true,
        main_style:{cursor: "pointer", background: "#5B97EF"}
      })


  },

  mainLeave:function () {
    this.setState({
      selected:false,
      main_style:{},
      logout_style:{background:"#000000"}
    })
  },



  logout:function () {
    window.location.href = "/accounts/logout";
  },

  logoutOver:function () {
    this.setState({
      logout_style: {cursor: "pointer", background: "#5B97EF"}
    })
  },

  logoutLeave:function () {
    this.setState({
      logout_style:{background: "#000000"}
    })
  },

  render: function () {
    return <div style = {this.state.main_style} id="user_commands" onMouseEnter = {this.mainOver} onMouseLeave = {this.mainLeave}>
              <p>{this.props.user_name} ▾
              </p>
              {
                this.state.selected && <div id="user_commands_container">
                                          <div style = {this.state.logout_style} id="user_commands_logout" onMouseLeave = {this.logoutLeave} onMouseOver = {this.logoutOver} onMouseDown = {this.logout}>
                                            <p> Logout </p>
                                          </div>
                                        </div>
              }
            </div>
  }
})

var Upload_Imgs = React.createClass({
  getInitialState:function(){
    return {
      closeUpload: this.props.closeUpload
    }
  },
  render: function() {
    return <div className="upload_main">
            <div onMouseDown = {this.state.closeUpload} className="close_upload">
            X
            </div>
            <div onMouseDown = {this.state.closeUpload} className="upload_drop_zone" id="upload_drop_zone">
              <p>Drag and Drop</p>
            </div>
            <File_Input album={this.props.current_album} author={this.props.author}/>
            </div>
  }

})



var Album_Container = React.createClass({
  updateSelectedImg: function(source,author) {
    this.setState({
      album_selected: source
    })
  },

  updateAlbumOrder: function(user_albums,contr_albums) {
    this.setState({
      user_album_holder: user_albums,
      contr_album_holder: contr_albums,
      user_albums: user_albums,
      contr_albums: contr_albums
    })
  },

  updateLoad: function(loading_status) {
    this.setState({
      loading:loading_status
    })
  },

  getInitialState: function() {
      return {
          user_album_holder: this.props.user_albums,
          contr_album_holder: this.props.contr_albums,
          friends_options: [],
          delete_album: false,
          user_albums:this.props.user_albums,
          contr_albums:this.props.contr_albums,
          album_selected: null,
          current_user: this.props.current_user,
          user_name: this.props.current_user+"'s",
          key_code: null,
          class_name: null,
          loading: false
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

  onChangeHandler:function (){
    this.setState({
      user_albums: [],
      contr_albums: [],
    })
    var search = document.getElementById("search_album").value;
    var matches =
      this.state.user_album_holder.filter((s) => {
        return s.name.indexOf( search ) !== -1;
      })
      var matches2 =
        this.state.contr_album_holder.filter((s) => {
          return s.name.indexOf( search ) !== -1;
        })

        setTimeout(() => {
          this.setState({
          user_albums: matches,
          contr_albums: matches2,
        })
      },5)
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

    // document.getElementById('trash').addEventListener('click', this.deleteAlbum, false);

  },

  componentWillMount: function() {
    this.getFriends();
  },

  getFriends: function () {
    $.ajax({
        url: "/get/friends",
        method: "GET",
        data: {}
    }).done((data) => {
        var friends = JSON.parse(data);

        if(friends !== false) {
          var friends_options = [];
          friends.map((x)=>{
            friends_options.push({value:x, label:x})
          })
          this.setState({
            friends_options: friends_options
          })
        }
    }).error(function (err) {
        console.log(err);
    });
  },

  change:function() {

  },

//<input type="text_field" id="search_album" onChange={this.onChangeHandler} />
  render: function() {
    window.scrollTo(0, 0);
    var friends_albums = "Friends' Albums";
    if(this.state.user_albums.length !== 0) {
      this.setState({
        loading: true
      })
    }
    if (this.state.loading) {
      return <div>
              <Loading_Cover/>

              <h1>Your Albums</h1>
              <Masonry
                  className={'user_albums'} // default ''
                  elementType={'div'} // default 'div'
                  options={masonryOptions} // default {}
                  disableImagesLoaded={false} // default false
                  onImagesLoaded={this.handleImagesLoaded}
              >
              {
                this.state.user_albums.map((x,y) => {
                  var img_urls = x.urls
                  var album_cover = img_urls[0];
                  var album_name = x.name;
                  var album_author = x.author;
                  var last_album = null;
                  if(this.state.contr_albums.length === 0) {
                    if(this.state.contr_albums.indexOf(x) === this.state.contr_albums.length-1) {
                      last_album = true;
                    }
                  }
                  return <Album_IMG friends_options={this.state.friends_options} updateLoad = {this.updateLoad} last_album = {last_album} key={y} contr_albums = {this.state.contr_albums} user_albums = {this.state.user_albums}  delete_album={this.delete_album} select_source_method={this.select_source_method} current_user = {this.props.current_user} key_code = {this.state.key_code}  album_author = {album_author} album_name = {album_name} class_name = {"col-sm album_img selected"} urls = {img_urls} img_source = {album_cover} />
                })

              }
              </Masonry>
              <h1>Tagged Albums</h1>
              <Masonry
              className={'contr_albums'} // default ''
              elementType={'div'} // default 'div'
              options={masonryOptions} // default {}
              disableImagesLoaded={false} // default false
              >
              {
              this.state.contr_albums.map((x,y) => {
                var last_album = null;
                if(this.state.contr_albums.indexOf(x) === this.state.contr_albums.length-1) {
                  last_album = true;
                }
                var img_urls = x.urls
                var album_cover = img_urls[0];
                var album_name = x.name;
                var album_author = x.author;
                return <Album_IMG friends_options={this.state.friends_options} key={y} contr_albums = {this.state.contr_albums} updateLoad = {this.updateLoad} last_album = {last_album} user_albums = {this.state.user_albums}  delete_album={this.delete_album} select_source_method={this.select_source_method} current_user = {this.props.current_user} key_code = {this.state.key_code}  album_author = {album_author} album_name = {album_name} class_name = {"col-sm album_img selected"} urls = {img_urls} img_source = {album_cover} />
              })
            }
            </Masonry>
            </div>
    }else {
      return <div id="album_holder">
              <Header friends_options={this.state.friends_options} current_user={this.state.current_user} contr_albums = {this.state.contr_albums}  user_albums = {this.state.user_albums} />
              <Sort_User_Albums_Container updateAlbumOrder = {this.updateAlbumOrder} />
              <div id="user_albums_title">
                <Search_Albums onChangeHandler = {this.onChangeHandler} />
                <span className="album_title">{this.state.user_name} Albums</span>
              </div>
              <Masonry
                  className={'user_albums'} // default ''
                  elementType={'div'} // default 'div'
                  options={masonryOptions} // default {}
                  disableImagesLoaded={false} // default false
                  onImagesLoaded={this.handleImagesLoaded}
              >
              {
                this.state.user_albums.map((x,y) => {
                  var img_urls = x.urls
                  try {
                  var album_cover = img_urls[0];
                  }catch(x) {
                  return <div></div>
                  }
                  var album_name = x.name;
                  var album_author = x.author;
                  return <Album_IMG friends_options={this.state.friends_options} key={y} contr_albums = {this.state.contr_albums}  user_albums = {this.state.user_albums}  delete_album={this.delete_album} select_source_method={this.select_source_method} current_user = {this.props.current_user} key_code = {this.state.key_code}  album_author = {album_author} album_name = {album_name} class_name = {"col-sm album_img selected"} urls = {img_urls} img_source = {album_cover} />
                })

              }
              </Masonry>
              <div id="friends_albums_title">
                <span className="album_title">{friends_albums}</span>
              </div>
              <Masonry
              className={'contr_albums'} // default ''
              elementType={'div'} // default 'div'
              options={masonryOptions} // default {}
              disableImagesLoaded={false} // default false
              >
              {
              this.state.contr_albums.map((x,y) => {
                var last_album = null;
                if(this.state.contr_albums.indexOf(x) === this.state.contr_albums.length-1) {
                  last_album = true;
                }
                var img_urls = x.urls
                try {
                var album_cover = img_urls[0];
                }catch(x) {
                return <div></div>
                }
                var album_name = x.name;
                var album_author = x.author;
                return <Album_IMG friends_options={this.state.friends_options} key={y} contr_albums  = {this.state.contr_albums} updateLoad = {this.updateLoad} last_album = {last_album} user_albums = {this.state.user_albums}  delete_album={this.delete_album} select_source_method={this.select_source_method} current_user = {this.props.current_user} key_code = {this.state.key_code}  album_author = {album_author} album_name = {album_name} class_name = {"col-sm album_img selected"} urls = {img_urls} img_source = {album_cover} />
              })
            }
            </Masonry>


            </div>
    }


  }
});


var Album_IMG = React.createClass({
  getInitialState: function () {
    return {
    updateLoad: this.props.updateLoad
  }
  },

  updateLoad: function () {
    this.state.updateLoad(false)
  },
  onMouseEnterHandler: function() {

  },
  onMouseLeaveHandler: function() {

  },


  render: function() {
    var divStyle = {
        backgroundImage: 'url(' + this.props.img_source + ')'
    };

      if(this.props.last_album) {
        return  <div className="album_image" onLoad = {this.updateLoad} style={divStyle}>
          <Album_Cover friends_options={this.props.friends_options} contr_albums = {this.props.contr_albums} user_albums = {this.props.user_albums}  delete_album={this.props.delete_album} select_source_method={this.props.select_source_method} current_user = {this.props.current_user} album_author = {this.props.album_author} album_name = {this.props.album_name} urls = {this.props.urls} img_source = {this.props.img_source} />

          </div>
      }else{
        return  <div className="album_image"  style={divStyle}>
          <Album_Cover friends_options={this.props.friends_options} contr_albums = {this.props.contr_albums} user_albums = {this.props.user_albums}  delete_album={this.props.delete_album} select_source_method={this.props.select_source_method} current_user = {this.props.current_user} album_author = {this.props.album_author} album_name = {this.props.album_name} urls = {this.props.urls} img_source = {this.props.img_source} />

          </div>
      }

  }
});

var Loading_Cover = React.createClass({


  componentWillUnmount:function() {
    var elem = ReactDOM.findDOMNode(this)
    // Set the opacity of the element to 0
    elem.style.opacity = 1;
    window.requestAnimationFrame(function() {
        // Now set a transition on the opacity
        elem.style.transition = "opacity 2000ms";
        // and set the opacity to 1
        elem.style.opacity = 0;
    });
  },
  render: function() {
return      <div id="loading"></div>

  }
})




var Album_Cover = React.createClass({
  getInitialState: function() {
    return {
      delete_album: this.props.delete_album,
      album_author: this.props.album_author,
      album_name: this.props.album_name,
      img_source: this.props.img_source,
      urls: this.props.urls,
      select_source_method: this.props.select_source_method,
      key_code: this.props.key_code,
      current_user: this.props.current_user
    }
  },

  onMouseDownHandler: function() {
    $("#loading").fadeIn("fast")
        album_selected = this.state.album_name;
        album_author = this.state.album_author;

        remount_left(this.props.album_name,this.props.album_author,this.props.urls,this.props.user_albums,this.props.contr_albums,this.props.current_user,this.props.friends_options);
  },

  render: function() {
    var album_cover = this.props.urls[0];
    return<div className="what" onMouseDown={this.onMouseDownHandler}>
    <img src={album_cover} />
    <div className="circle1"></div>
    <div className="circle2"></div>
    <div className="circle3"></div>
    <div className="title_cont"><p>{this.props.album_name}</p></div>
    </div>

  }
})

var Search_Albums = React.createClass({
  getInitialState: function () {
    return {
      onChangeHandler : this.props.onChangeHandler,
      placeholder : "",
    }
  },

  onFocusHandler: function () {
    // var search = document.getElementById("search_album").value;
    // search !== "" && this.state.onChangeHandler()
    this.setState({
      placeholder: "Search"
    })
  },

  onBlurHandler: function () {
    this.setState({
      placeholder: ""
    })
  },

  render: function () {
    return <input placeholder = {this.state.placeholder} id="search_album" onBlur = {this.onBlurHandler} onChange = {this.state.onChangeHandler} onFocus = {this.onFocusHandler} />
  }
})

var User_Album_Settings = React.createClass({
  getInitialState: function () {
    return {
      album_settings_visible: false
    }

  },
  onMouseDownHandler: function() {
    if(this.state.album_settings_visible) {
      this.setState({
        album_settings_visible: false
      })
    }else {
      this.setState({
        album_settings_visible: true
      })
    }

  },
  render: function() {
    return <div id="user_albums_settings_container">
             <div onMouseDown = {this.onMouseDownHandler} id="user_albums_settings">
             </div>

           </div>
  }

})


var Sort_User_Albums_Container = React.createClass({
  render: function () {

      return <div id="sort_user_albums_container">
              <div id="sort_user_albums">
                <span>Sort Albums </span>
              </div>
              <Sort_User_Albums_A_Z updateAlbumOrder = {this.props.updateAlbumOrder} />
              <Sort_User_Albums_Date_Created updateAlbumOrder = {this.props.updateAlbumOrder} />
              <Sort_User_Albums_Image_Count updateAlbumOrder = {this.props.updateAlbumOrder} />
            </div>
  }
})

var Sort_User_Albums_A_Z = React.createClass({
  getInitialState: function () {
    return {
      background:"#3498DB",
      cursor:"default",
      borderBottom: "5px solid #2980B9",
      updateAlbumOrder: this.props.updateAlbumOrder,
      direction: ""
    }

  },

  onMouseOverHandler:function () {
      this.setState({
        cursor:"pointer"
      })
  },

  onMouseLeaveHandler:function () {
      this.setState({
        cursor:"default"
      })
  },

  onMouseDownHandler: function() {
    this.updateOrder()
    if(this.state.direction === "") {
      this.setState({
        borderBottom: "3px solid #2980B9",
        direction: "-"
      })
    }else {
      this.setState({
        borderBottom: "3px solid #2980B9",
        direction: ""
      })
    }
  },

  onMouseUpHandler: function () {
    this.setState({
      borderBottom: "5px solid #2980B9"
    })
  },

  updateOrder: function () {
    $.ajax({
        url: "/get/",
        method: "GET",
        data: {sorting_method:"a-z",
               direction: this.state.direction
              }
    }).done((data) => {
        albums = JSON.parse(data);
        var user_albums = albums.album_url_list['user_albums'];
        var contr_albums = albums.album_url_list['contr_albums'];
        this.state.updateAlbumOrder(user_albums,contr_albums);
    }).error(function (err) {
        console.log(err);
    });
  },


  render: function () {
    var divStyle = {
      background:this.state.background,
      borderBottom:this.state.borderBottom,
      cursor:this.state.cursor
    }
    return <div onMouseUp = {this.onMouseUpHandler} onMouseDown = {this.onMouseDownHandler} onMouseLeave = {this.onMouseLeaveHandler} onMouseOver = {this.onMouseOverHandler} className = "animate action_button" id="sort_user_albums_A_Z" style={divStyle}>
            <span>A - Z </span>
           </div>
  }
})

var Sort_User_Albums_Date_Created = React.createClass({
  getInitialState: function () {
    return {
      background:"#3498DB",
      borderBottom: "5px solid #2980B9",
      updateAlbumOrder: this.props.updateAlbumOrder,
      direction: "",
      cursor:"default"
    }

  },

  onMouseOverHandler:function () {
      this.setState({
        cursor: "pointer"
      })
  },

  onMouseLeaveHandler:function () {
      this.setState({
        cursor: "default"
      })
  },

  onMouseDownHandler: function() {
    this.updateOrder()
    if(this.state.direction === "") {
      this.setState({
        borderBottom: "3px solid #2980B9",
        direction: "-"
      })
    }else {
      this.setState({
        borderBottom: "3px solid #2980B9",
        direction: ""
      })
    }
  },

  onMouseUpHandler: function () {
    this.setState({
      borderBottom: "5px solid #2980B9"
    })
  },

  updateOrder: function () {
    $.ajax({
        url: "/get/",
        method: "GET",
        data: {sorting_method:"date",
               direction: this.state.direction
              }
    }).done((data) => {
        albums = JSON.parse(data);
        var user_albums = albums.album_url_list['user_albums'];
        var contr_albums = albums.album_url_list['contr_albums'];
        this.state.updateAlbumOrder(user_albums,contr_albums);
    }).error(function (err) {
        console.log(err);
    });
  },


  render: function () {
    var divStyle = {
      background:this.state.background,
      borderBottom:this.state.borderBottom,
      cursor:this.state.cursor
    }
    return <div onMouseUp = {this.onMouseUpHandler} onMouseDown = {this.onMouseDownHandler} onMouseLeave = {this.onMouseLeaveHandler} onMouseOver = {this.onMouseOverHandler} className = "animate action_button" id="sort_user_albums_date_created" style={divStyle}>
            <span>Date Created</span>
           </div>
  }
})

var Sort_User_Albums_Image_Count = React.createClass({
  getInitialState: function () {
    return {
      background:"#3498DB",
      borderBottom: "5px solid #2980B9",
      updateAlbumOrder: this.props.updateAlbumOrder,
      direction: "-",
      cursor: "default"
    }
  },

  onMouseOverHandler:function () {
      this.setState({
        cursor:"pointer"
      })
  },

  onMouseLeaveHandler:function () {
      this.setState({
        cursor:"default"
      })
  },

  onMouseDownHandler: function() {
    this.updateOrder()
    if(this.state.direction === "") {
      this.setState({
        borderBottom: "3px solid #2980B9",
        direction: "-"
      })
    }else {
      this.setState({
        borderBottom: "3px solid #2980B9",
        direction: ""
      })
    }
  },

  onMouseUpHandler: function () {
    this.setState({
      borderBottom: "5px solid #2980B9"
    })
  },

  updateOrder: function () {
    $.ajax({
        url: "/get/",
        method: "GET",
        data: {sorting_method:"image_count",
               direction: this.state.direction
              }
    }).done((data) => {
        albums = JSON.parse(data);
        var user_albums = albums.album_url_list['user_albums'];
        var contr_albums = albums.album_url_list['contr_albums'];
        this.state.updateAlbumOrder(user_albums,contr_albums);
    }).error(function (err) {
        console.log(err);
    });
  },


  render: function () {
    var divStyle = {
      background:this.state.background,
      borderBottom:this.state.borderBottom,
      cursor:this.state.cursor
    }
    return <div onMouseUp = {this.onMouseUpHandler} onMouseDown = {this.onMouseDownHandler} onMouseLeave = {this.onMouseLeaveHandler} onMouseOver = {this.onMouseOverHandler} className = "animate action_button" id="sort_user_albums_image_count" style={divStyle}>
            <span>Image Count</span>
           </div>
  }
})


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
          main_img: this.props.images[0],
          user_albums: this.props.user_albums,
          contr_albums: this.props.contr_albums,
          images: this.props.images,
          select_source: [this.props.images[0]],
          album_selected: this.props.album_selected,
          album_author: this.props.album_author,
          current_user: this.props.current_user,
          key_code: null,
          loading: true,
          upload:false

      }
  },
  updateLoad: function(loading_status) {
    this.setState({
      loading:loading_status
    })


  },
  keyDown: function(event){
    // this.setState({
    // key_code:event.keyCode
    // })
    // var elem = document.getElementById("main_img_container");
    // if (elem.requestFullscreen) {
    //   elem.requestFullscreen();
    // } else if (elem.msRequestFullscreen) {
    //   elem.msRequestFullscreen();
    // } else if (elem.mozRequestFullScreen) {
    //   elem.mozRequestFullScreen();
    // } else if (elem.webkitRequestFullscreen) {
    //   elem.webkitRequestFullscreen();
    // }
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

  uploadImg:function () {
    this.setState({
      upload:true
    })
    setTimeout(()=>{
      if (load === null) {
        load = new Load(this.props.album_selected,this.props.album_author,this.props.images,this.props.user_albums,this.props.contr_albums)
        load.listenForDrop();
      }else {
        load.updateImages(this.state.urls)
        load.updateSelected(this.props.album_selected,this.props.album_author)
      }
    },200)
  },

  closeUpload:function() {
    this.setState({
      upload:false
    })
    load = null;
  },
  render: function() {
      var last_image = false


      return <div id="album_holder">
              {
                (this.state.upload) && <Upload_Imgs current_album = {this.state.album_selected} author={this.state.current_user} closeUpload = {this.closeUpload} />
              }
              {
                (this.state.loading) && <Loading_Cover />
              }
              <Header friends_options={this.props.friends_options} current_user={this.state.current_user} contr_albums = {this.state.contr_albums}  user_albums = {this.state.user_albums} />
              <div id="album_title">
                <div onMouseDown = {this.uploadImg} id="upload_image" >
                </div>
                <div id="album_settings">
                </div>
                <span className="album_title">{this.props.album_selected}</span>
              </div>
              <Masonry
                className={'view_images'} // default ''
                elementType={'div'} // default 'div'
                options={masonryOptions} // default {}
                disableImagesLoaded={false} // default false
              >
              {
                this.props.images.map((src, i) => {
                  if(this.props.images.indexOf(src) === this.props.images.length - 1){
                    last_image = true;
                  }
                  return <View_IMG user_albums = {this.state.user_albums} contr_albums = {this.state.contr_albums} album_images = {this.state.images} last_image = {last_image} updateLoad = {this.updateLoad} img_source = {src} key_code = {this.state.key_code} current_user = {this.state.current_user} album_author = {this.props.album_author} album_selected = {this.props.album_selected} select_source={this.state.select_source} select_source_method={this.updateSelectedImg} key={i} />
                })
              }
              </Masonry>
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
    // document.getElementById('trash').addEventListener('click', this.deleteImgs, false);
    // document.getElementById('back_albums').addEventListener('click', this.backAlbums, false);
    // ReactDOM.render(React.createElement(Rotate_IMG, { img_source: album_lst[0] }), document.getElementById('right'));

  },
  componentWillUnmount: function() {
    // document.getElementById('trash').removeEventListener('click', this.deleteImgs, false);
    // document.getElementById('back_albums').removeEventListener('click', this.backAlbums, false);
  },
  componentWillMount: function() {
    this.getUserInfo();
  }
});

var View_IMG = React.createClass({
    getInitialState: function() {
        return {
            album_images: this.props.album_images,
            updateLoad: this.props.updateLoad,
            current_user: this.props.current_user,
            album_selected: this.props.album_selected,
            album_author: this.props.album_author,
            hidden: 'hidden',
            select_source_method: this.props.select_source_method,
            img_source: this.props.img_source,
            img_number: this.props.img_number,
            class_name: this.props.class_name,
            key_code: this.props.key_code
        }
    },

    updateLoad:function() {
      setTimeout(() =>{
        this.state.updateLoad(false);
    },400)

  },


    deleteImg: function() {
      var lst = [];
      lst.push(this.state.img_source)
        delete_url(lst,this.state.album_selected);
    },

    onMouseDownHandler: function() {
      ReactDOM.unmountComponentAtNode(document.getElementById('main'));
      ReactDOM.render(React.createElement(Slideshow, {current_user: this.state.current_user, user_albums: this.props.user_albums, contr_albums: this.props.contr_albums, album_images: this.state.album_images, img_source:this.state.img_source }), document.getElementById('main'));

    },

    render: function() {
      if (this.props.last_image) {
        return  <div onMouseDown={this.onMouseDownHandler} className={'view_image'}>
                <img onLoad={this.updateLoad} src={this.props.img_source} />
                </div>
      }else {
        return  <div  onMouseDown={this.onMouseDownHandler} className={'view_image'}>
                <img src={this.props.img_source} />
                </div>
      }

    }
});
var keyframesMidToLeft = Radium.keyframes({
  '0%': {left: 0},
  '100%': {left: '-200em'},
});

var keyframesMidToRight = Radium.keyframes({
  '0%': {left: 0},

  '100%':{left: '200em'},
});

var keyframesRightToMid = Radium.keyframes({
  '0%': {left: '100em'},
  '100%': {left: 0},
});

var keyframesLeftToMid = Radium.keyframes({
  '0%': {left: '-150em'},
  '100%': {left: 0},
});

var styles = {
  mid_left: {
  animation: 'x .2s linear 0s ',
  animationName: keyframesMidToLeft,
  left: "-200em"
  },

  mid_right: {
  animation: 'x .2s linear 0s ',
  animationName: keyframesMidToRight,
  left:"200em"
  },

  right_mid: {
  animation: 'x .2s linear 0s ',
  animationName: keyframesRightToMid,
  left: 0
  },

  left_mid:{
  animation: 'x .2s linear 0s ',
  animationName: keyframesLeftToMid,
  left: 0
  },

  center: {
  left:0
  },

  right: {
  left:'150em',
  },

  left: {
  left:'-150em',
  }

}
var center = true;

var Slideshow = React.createClass({
    getInitialState: function() {
        return {
            img_source: this.props.img_source,
            previousImg: this.props.previousImg,
            next_img: this.props.nextImg,
            center_style: styles.center,
            next_img_style: styles.right,
            selected_img: this.props.img_source
        }
    },

    updateSelectedImg: function (new_img) {
      if(center){
        this.setState({

          next_img: new_img,
          selected_img: new_img,
          next_img_style:styles.right_mid,
          center_style:styles.mid_left

        })
        center = false;
      }else {
        this.setState({
          img_source: new_img,
          selected_img: new_img,
          center_style:styles.right_mid,
          next_img_style:styles.mid_left,

        })
        center = true;
      }
    },

    componentWillMount: function () {


    },

    nextImg: function() {
      if(center){
        var current_index = this.props.album_images.indexOf(this.state.img_source);
        var new_img;
        if (current_index !== this.props.album_images.length - 1) {
          new_img = this.props.album_images[current_index+1];
        } else {

          new_img = this.props.album_images[0];
          var myImage = new Image();
          myImage.src = new_img;
        }

          this.setState({
            next_img: new_img,
            next_img_style:styles.right_mid,
            center_style:styles.mid_left,
            selected_img: new_img
          })


        center = false;
      }else {
        var current_index = this.props.album_images.indexOf(this.state.next_img);
        var new_img;
        if (current_index !== this.props.album_images.length - 1) {
          new_img = this.props.album_images[current_index+1];
        } else {
          new_img = this.props.album_images[0];
          var myImage = new Image();
          myImage.src = new_img;
        }

          this.setState({
            img_source: new_img,
            center_style:styles.right_mid,
            next_img_style:styles.mid_left,
            selected_img: new_img
          })

        center = true;
      }

    },

    previousImg: function() {
      if(center){
        var current_index = this.props.album_images.indexOf(this.state.img_source);
        var new_img;
        if (current_index > 0) {
          new_img = this.props.album_images[current_index-1];
        } else if (current_index === 0 && this.props.album_images.length === 1) {
        } else {
          new_img = this.props.album_images[this.props.album_images.length - 1];
          var myImage = new Image();
          myImage.src = new_img;
        }

        this.setState({
          next_img: new_img,
          next_img_style:styles.left_mid,
          center_style:styles.mid_right,
          selected_img: new_img
        })

        center = false;
      }else {
        var current_index = this.props.album_images.indexOf(this.state.next_img);
        var new_img;
        if (current_index > 0) {
          new_img = this.props.album_images[current_index-1];
        } else if (current_index === 0 && this.props.album_images.length === 1) {
        } else {
          new_img = this.props.album_images[this.props.album_images.length - 1];
          var myImage = new Image();
          myImage.src = new_img;
        }
        this.setState({
          img_source: new_img,
          center_style:styles.left_mid,
          next_img_style:styles.mid_right,
          selected_img: new_img
        })
        center = true;
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

      var main_back_image = {
        backgroundImage: 'url(' + this.state.img_source + ')'
      }
      var next_back_image = {
        backgroundImage: 'url(' + this.state.next_img + ')'
      }
      var main_div_style = $.extend(true, {}, main_back_image, this.state.center_style);
      var next_img_style = $.extend(true, {}, next_back_image, this.state.next_img_style);

        return    <div className="slideshow_container">
                    <Header current_user = {this.props.current_user} user_albums = {this.props.user_albums} contr_albums = {this.props.contr_albums} />
                    <StyleRoot>
                      <div style={main_div_style} id="main_img_container" onMouseDown = {this.onMouseDownHandler} className={"main_img_container"}>
                      </div>
                      <div style={next_img_style} id="next_img_container" onMouseDown = {this.onMouseDownHandler} className={"next_img_container"}>
                      </div>
                    </StyleRoot>
                    <Thumbnail_Slider updateSelectedImg = {this.updateSelectedImg} album_images = {this.props.album_images} selected_img = {this.state.selected_img} />
                    <Next_IMG_Button nextImg = {this.nextImg}  />
                    <Previous_IMG_Button previousImg = {this.previousImg} />
                  </div>

    }
})
module.exports = Radium(Slideshow);

var Thumbnail_Slider = React.createClass({

render:function() {
  var width = ( this.props.album_images.length  * 9 + 2 )
  var thumb_style = {
    width : width+"em",
    margin: "0 auto"
  }
  return <div className="slider_container">
          <StyleRoot>
          <div className="thumbnail_container" style={thumb_style}>
            {
              this.props.album_images.map((x,y)=>{
                return <Thumbnail_Image updateSelectedImg = {this.props.updateSelectedImg} key={y} img_source = {x} selected_img = {this.props.selected_img} />
              })
            }
          </div>
          </StyleRoot>
        </div>
},

})

module.exports = Radium(Slideshow);
module.exports = Radium(Thumbnail_Slider);
var Thumbnail_Image = React.createClass({
  getInitialState:function () {
    return {
      updateSelectedImg:this.props.updateSelectedImg
    }
  },

  onMouseDownHandler: function () {
    this.state.updateSelectedImg(this.props.img_source)
  },

  render:function () {
    if(this.props.selected_img === this.props.img_source) {
        var background = {
        backgroundImage: 'url(' + this.props.img_source + ')',
        outline: 'none',
        boxshadow:'0px 1rem 1rem .5rem #333',
        border: '1pt blue solid'
      }
    }else {
      var background = {
        backgroundImage: 'url(' + this.props.img_source + ')'
      }
    }

    return <div onMouseDown = {this.onMouseDownHandler} className="thumbnail_img" style={background}>
          </div>
  }
})

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


function get_albums(sorting_method,direction) {
    $.ajax({
        url: "/get/",
        method: "GET",
        data: {sorting_method:sorting_method,
               direction: direction
              }
    }).done(function (data) {
        albums = JSON.parse(data);
        var user_albums = albums.album_url_list['user_albums'];
        var contr_albums = albums.album_url_list['contr_albums'];
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
            uploadImgur(event.target.result,this.props.album,this.props.author);
        };
        reader.readAsDataURL(file);
    },

    render: function() {
        return  <div className="manual_upload">
                  <label htmlFor="file-input">
                  <img src="http://i.imgur.com/vhoHhIV.png"/>
                  </label>

                  <input id="file-input" onChange={this.onChangeHandler} type={"file"}/>
                  </div>


    }
});


function update_temp_img(images,number_of_images) {
  var loading = 'http://i.imgur.com/JzVkr04.gif'
  var img_lst = images
  for(var x = 0; x < number_of_images; x++) {
        img_lst.push(loading);
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
  var images = []

  res.map((x) => {

  images.push({ images: [x], row: images.length });
  })
  return images
}

function remount_left(album_name, album_author, images,user_albums,contr_albums,current_user,friends) {
    ReactDOM.unmountComponentAtNode(document.getElementById('main'));
    ReactDOM.render(React.createElement(Min_Container, {user_albums: user_albums, contr_albums: contr_albums, images: images, album_author: album_author, album_selected: album_name, current_user:current_user, friends_options:friends}), document.getElementById('main'));
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

function uploadProfileImage(base64) {
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
        $('#new_user_profile_picture_url').val(link);
        var $url = $('#new_user_profile_picture_url').val();
        $('#new_user_profile_picture').css("background-size", "cover");
        $('#new_user_profile_picture').css("background-image", "url("+$url+")");
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
      var user_albums = result.albums.user_albums;
      var contr_albums = result.albums.contr_albums;

      remount_left(result.album,result.author,img_result,user_albums,contr_albums,author)

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
        get_albums("a-z","");
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
    get_albums("a-z","")
  }catch(x) {
  }

}

main();
