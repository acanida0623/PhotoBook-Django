var React = require('react')
var ReactDOM = require('react-dom')
var images = [{ images: [], row: 0 }];
var user_album_images = [{albums: []}];
var contr_album_images = [{albums: []}];
var img_lst = [];
var albums = [];

// <br />
//
// <h1>Contributing Albums</h1>
// <table className="main_table">
//     <tbody>
//       { if (contr_album_images[0].albums.length > 0) {
//         contr_album_images.map((src, i) => {
//           return <Album_Row images={contr_album_images} row={i} key={i} />
//         }).map(function(src){
//             return src
//         })
//       }
//
//       }
//     </tbody>
//   </table>


function AddLoad(selected) {
  if (window.FileReader) {
      var drop;


          // var status = document.getElementById('status');
          drop = document.getElementById('table');
          // var list = document.getElementById('list');

          function cancel(e) {
              if (e.preventDefault) {
                  e.preventDefault();
              }
              return false;
          }

          // Tells the browser that we *can* drop on this target
          try {
              addEventHandler(window, 'dragover', cancel);
              addEventHandler(window, 'dragenter', cancel);
              addEventHandler(window, 'drop', function  (e)  {
                console.log('test');

              e = e || window.event; // get window.event if e argument missing (in IE)
              if (e.preventDefault) {
                  e.preventDefault();
              } // stops the browser from redirecting off to the image.

              var dt = e.dataTransfer;
              var files = dt.files;

              for (var i = 0; i < files.length; i++) {
                  update_temp_img();
                  var file = files[i];
                  var reader = new FileReader();


                  //attach event handlers here...

                  reader.readAsDataURL(file);
                  addEventHandler(reader, 'loadend', function (e, file) {

                      var bin = this.result;
                      uploadImgur(bin,selected);
                      // var newFile = document.createElement('div');
                      // newFile.innerHTML = 'Loaded : ' + file.name + ' size ' + file.size + ' B';
                      // list.appendChild(newFile);
                      // var fileNumber = list.getElementsByTagName('div').length;
                      // status.innerHTML = fileNumber < files.length ? 'Loaded 100% of file ' + fileNumber + ' of ' + files.length + '...' : 'Done loading. processed ' + fileNumber + ' files.';

                      // var img = document.createElement("img");
                      // img.file = file;
                      // img.src = bin;
                      // list.appendChild(img);
                  }.bindToEventHandler(file));
              }
              remount_left(selected);
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



}

var Album_Container = React.createClass({
  render: function() {
    return    <div className="table_holder">
                <h1>Your Albums</h1>
                <table className="main_table">
                    <tbody>
                      {
                        user_album_images.map((src, i) => {
                          return <Album_Row images = {user_album_images} row = {i} key = {i} />
                        }).map(function(src){
                            return src
                        })
                      }
                    </tbody>
                  </table>

              </div>

  }
});

var Album_Row = React.createClass({
    getInitialState: function() {
        return {
            select_source_method: this.props.select_source_method,
            select_source: this.props.select_source
        }
    },

    render: function() {
        var row = this.props.row;
        var img_urls = this.props.images[row].albums[0].urls.split(',');
        console.log(img_urls)
        var album_cover = img_urls[0];
        var album_name = this.props.images[row].albums[row].name;
        return  <tr id = {"row" + this.props.row} key = {this.props.row}>
                   <td>
                      <Album_IMG album_name = {album_name} class_name = {"col-sm album_img"} urls = {img_urls} img_source = {album_cover} />
                   </td>
                </tr>
    }
});

var Album_IMG = React.createClass({
    getInitialState: function() {
        return {
            hidden: 'hidden',
            album_name: this.props.album_name,
            img_source: this.props.img_source,
            class_name: this.props.class_name,
            urls: this.props.urls
        };
    },
    onMouseEnterHandler: function() {

    },
    onMouseLeaveHandler: function() {

    },

    onMouseDownHandler: function() {
      img_lst.length = 0;
        this.state.urls.map((x) => {
            update_img_list(x);
        })
        remount_left(this.state.album_name);

    },

    selectAlbum: function() {

    },

    render: function() {
      var divStyle = {
          backgroundImage: 'url(' + this.props.img_source + ')'
      };
        return  <div>
                <h5>{this.props.album_name}</h5>
                <div onMouseDown={this.onMouseDownHandler} onMouseEnter={this.onMouseEnterHandler} onMouseLeave={this.onMouseLeaveHandler} className={this.props.class_name} id={"img_" + this.props.img_number} style={divStyle}>
                </div>
                </div>


    }
});

var Min_Container = React.createClass({

  updateSelectedImg: function(source) {
      this.setState({ select_source: source });
  },

  getInitialState: function() {
      return {
          select_source: this.props.select_source,
          album_selected: this.props.album_selected
      }
  },
  render: function() {
    return    <div id="table" className="table_holder">
                <table className="main_table">
                    <tbody>
                      {
                        images.map((src, i) => {
                          return <Row select_source={this.state.select_source} select_source_method={this.updateSelectedImg} row={i} key={i} />
                        }).map(function(src){
                            return src
                        })
                      }
                    </tbody>
                  </table>
              </div>

  },
  componentDidMount: function() {
    console.log("mounted");
      AddLoad(this.state.album_selected);
  }
});

function update_album_list(res) {
    console.log(res.user_albums)
    res.user_albums.map((x) => {
      if (user_album_images[user_album_images.length - 1].albums.length < 4) {
          user_album_images[user_album_images.length - 1].albums.push(x);
      } else {
          user_album_images.push({ albums: [res]});
      }
    })
    res.contr_albums.map((x) => {
      if (contr_album_images[contr_album_images.length - 1].albums.length < 4) {
          contr_album_images[contr_album_images.length - 1].albums.push(x);
      } else {
          contr_album_images.push({ albums: [res]});
      }
    })

}

function get_albums(res) {
    $.ajax({
        url: "http://127.0.0.1:8000/get/",
        method: "GET",
        data: {}
    }).done(function (data) {
      console.log(data)
        albums = JSON.parse(data);
        console.log(albums)
        update_album_list(albums);
        ReactDOM.unmountComponentAtNode(document.getElementById("left"));
        ReactDOM.render(React.createElement(Album_Container), document.getElementById('left'));

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

var Row = React.createClass({
    getInitialState: function() {
        return {
            select_source_method: this.props.select_source_method,
            select_source: this.props.select_source
        }
    },

    render: function() {
        var row = this.props.row;
        var img_list = filter_row(images, row);
        return  <tr id={"row"+this.props.row} key={this.props.row}>
                {
                  img_list[0].map((src, i) => {
                    var ran = (Math.floor(Math.random() * (9999 - 1)) + 1)
                    if (src === this.props.select_source) {

                      return <td key={ran}>
                                  <View_IMG select_source_method={this.props.select_source_method} class_name={"col-sm selected"} img_number={i} img_source={src} />
                              </td>
                    } else {

                      return <td key={ran}>
                                <View_IMG select_source_method={this.props.select_source_method} class_name={"col-sm"} img_number={i} img_source={src} />
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
            hidden: 'hidden',
            select_source_method: this.props.select_source_method,
            img_source: this.props.img_source,
            img_number: this.props.img_number,
            class_name: this.props.class_name
        };
    },
    onMouseEnterHandler: function() {
      this.setState({
        hidden:'show'
      })
    },
    onMouseLeaveHandler: function() {
      this.setState({
        hidden:'hidden'
      })
    },

    deleteImg: function() {
      delete_url(this.state.img_source);
    },
    onMouseDownHandler: function() {
        this.state.select_source_method(this.state.img_source);
        ReactDOM.unmountComponentAtNode(document.getElementById("right"));
        ReactDOM.render(React.createElement(Rotate_IMG, { img_source: this.props.img_source }), document.getElementById('right'));
    },
    render: function() {
      var divStyle = {
          backgroundImage: 'url(' + this.props.img_source + ')'
      };
        console.log(this.props.class_name)
        return  <div onMouseDown={this.onMouseDownHandler} onMouseEnter={this.onMouseEnterHandler} onMouseLeave={this.onMouseLeaveHandler} className={this.props.class_name} id={"img_" + this.props.img_number} style={divStyle}>
                <div className={"delete_img "+this.state.hidden} onMouseDown={this.deleteImg}></div>
                </div>

    }
});

var Rotate_IMG = React.createClass({
    getInitialState: function() {
        return {
            source: this.props.img_source
        }
    },
    componentDidMount: function() {
        var intervalId = setInterval(() => {
            this.rotate_images();
        }, 3000);
        this.setState({ intervalId: intervalId });
    },

    componentWillUnmount: function() {
        clearInterval(this.state.intervalId);
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
        return <div style={divStyle} className={"main_img_container"}>
              </div>

    }

});

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

//i.imgur.com/JzVkr04.gif
function update_temp_img() {
  var loading = 'http://i.imgur.com/JzVkr04.gif'
    // img_lst.push(loading);
    if (images[images.length - 1].images.length < 4) {
        images[images.length - 1].images.push(loading);
    } else {
        images.push({ images: [loading], row: images.length });
    }
    console.log("imagetest"+images)
}

function replace_temp_img(res) {
    var loading = 'http://i.imgur.com/JzVkr04.gif'
    // for(var x = 0; x < img_lst.length; x++) {
    //     if (img_lst[x] === loading) {
    //         img_lst[x] = res
    //         break;
    //     }
    // }
    console.log(img_lst)
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
    img_lst.push(res);
    if (images[images.length - 1].images.length < 4) {
        images[images.length - 1].images.push(res);
    } else {
        images.push({ images: [res], row: images.length });
    }
    console.log(images)
}

function remount_left(album_name) {
    ReactDOM.unmountComponentAtNode(document.getElementById("left"));
    ReactDOM.render(React.createElement(Min_Container, {album_selected: album_name}), document.getElementById('left'));
}


try {
    ReactDOM.render(React.createElement(File_Input), document.getElementById('upload'));
} catch (err) {
    alert(err.message);
}

window.onbeforeunload = function (e) {
    return 'Please press the Logout button to logout.';
};

function saveFile(url) {
    // Get file name from url.
    var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function () {
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob
        a.download = filename; // Set the file name.
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        delete a.href, a.download, a.style.display;
    };
    xhr.open('GET', url);
    xhr.send();
}

function uploadImgur(base64,album) {
    var base64 = base64.replace(/^.*base64,/, '');

    $.ajax({
        method: 'POST',
        url: 'https://api.imgur.com/3/image',
        headers: {
            Authorization: 'Client-ID 4d075e399079cdc'
        },
        data: {
            image: base64 // base64 string, not a data URI
        }
    }).done((res) => {

        var link = res.data.link;
        console.log(link);
        console.log(album);
        replace_temp_img(link);
        setTimeout(() => {
          update_server_url(res,album);
          remount_left(album)
        },100)

        // saveFile(link);
    }).error(function (err) {
        console.log(err);
        alert(err);
    });
}


function update_server_url(res,album) {
    var result = { 'url': res.data.link, 'album':album };
    result = JSON.stringify(result);
    $.ajax({
        url: "http://127.0.0.1:8000/save/",
        method: "POST",
        data: result
    }).done(function (data) {


    }).error(function (err) {
        console.log(err);
        alert(err);
    });
}

function delete_url(res) {
    var result = { 'url': res };
    result = JSON.stringify(result);
    $.ajax({
        url: "http://127.0.0.1:8000/delete/",
        method: "POST",
        data: result
    }).done(function (data) {
        images.length = 0;
        img_lst.length = 0;
        images = [{ images: [], row: 0 }];
        img_lst = [];
        get_urls();
    }).error(function (err) {
        console.log(err);
        alert(err);
    });
}
try {
  get_albums()
}catch(x) {

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

addEventHandler(document.getElementById('page-header-color'),'change',function(){
  console.log("change")
    var value = document.getElementById('page-header-color').value;
    document.getElementById('page-header').style.backgroundColor = "#"+value;
})
