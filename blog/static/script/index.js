var images = [{ images: [], row: 0 }];
var img_lst = [];

var Min_Container = React.createClass({

  updateSelectedImg: function updateSelectedImg(source) {
      this.setState({ select_source: source });
  },

  getInitialState: function getInitialState() {
      return {
          select_source: this.props.select_source
      };
  },
  render:() => {
    return    <div>
                <table>
                    <tbody>
                      {
                        images.map(function (src, i) {
                          return <Row select_source={this.state.select_source} select_source_method={this.updateSelectedImg} row={i} key={i} />
                        }).map(function(src){
                            return src
                        })
                      }
                    </tbody>
                  </table>
              </div>
  }
});

function filter_row(image_list, row) {
    return image_list.map(function (src) {
        if (src.row === row) {
            return src.images;
        }
    }).filter(function (x) {
        return typeof x !== 'undefined';
    });
};

var Row = React.createClass({
    getInitialState: function getInitialState() {
        return {
            select_source_method: this.props.select_source_method,
            select_source: this.props.select_source
        }
    },

    render:() => {
        var row = this.props.row;
        var img_list = filter_row(images, row);
        return <tr id="row"+this.props.row, key=this.props.row>
                {
                  img_list[0].map(function (src, i) {
                    if (src === this.props.select_source) {

                        return <td>
                                  <View_IMG select_source_method={this.props.select_source_method} class_name={"col-sm selected"} img_number={i} img_source={src} />
                              </td>
                    } else {
                            <td>
                                <View_IMG select_source_method={this.props.select_source_method} class_name={"col-sm"} img_number={i} img_source={src} />
                            </td>
                          }
                  })
                }
              </tr>
    }
});

var View_IMG = React.createClass({
    getInitialState:() => {
        return {
            hover: false,
            select_source_method: this.props.select_source_method,
            img_source: this.props.img_source,
            img_number: this.props.img_number,
            class_name: this.props.class_name
        };
    },
    onMouseDownHandler:() => {
        this.state.select_source_method(this.state.img_source);
        ReactDOM.unmountComponentAtNode(document.getElementById("right"));
        ReactDOM.render(React.createElement(Rotate_IMG, { img_source: this.props.img_source }), document.getElementById('right'));
    },
    render:() => {
      var divStyle = {
          backgroundImage: 'url(' + this.props.img_source + ')'
      };
        console.log(this.props.class_name)
        return <div onMouseDown={this.onMouseDownHandler} className={this.props.class_name} id={"img_" + this.props.img_number} style=divStyle>
                </div>
    }
});

var Rotate_IMG = React.createClass({
    getInitialState:() => {
        return {
            source: this.props.img_source
        }
    },
    componentDidMount:() => {
        var intervalId = setInterval(() => {
            this.rotate_images();
        }, 3000);
        this.setState({ intervalId: intervalId });
    },

    componentWillUnmount:() => {
        clearInterval(this.state.intervalId);
    },
    rotate_images:() => {
        var index = img_lst.indexOf(this.state.source);
        if (index !== img_lst.length - 1) {
            index += 1;
            this.setState({ source: img_lst[index] });
        } else {
            this.setState({ source: img_lst[0] });
        }
    },
    render: function render() {
        var divStyle = {
            backgroundImage: 'url(' + this.state.source + ')'
        };
        return <div style=divStyle className="main_img_container">
              </div>
    }

});

var File_Input = React.createClass({
    displayName: 'File_Input',

    onChangeHandler: function onChangeHandler(event) {
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function (event) {
            uploadImgur(event.target.result);
        };
        reader.readAsDataURL(file);
    },

    render:() => {
        return <input onChange={this.onChangeHandler} type="file" />
    }
});

function update_img_list(res) {
    img_lst.push(res);
    if (images[images.length - 1].images.length < 4) {
        images[images.length - 1].images.push(res);
    } else {
        images.push({ images: [res], row: images.length });
    }
}

function remount_left() {
    ReactDOM.unmountComponentAtNode(document.getElementById("left"));
    ReactDOM.render(React.createElement(Min_Container), document.getElementById('left'));
}

ReactDOM.render(React.createElement(File_Input), document.getElementById('upload'));

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

function uploadImgur(base64) {
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
    }).done(function (res) {

        var link = res.data.link;
        console.log(link);
        update_img_list(link); // image successfully uploaded
        remount_left();
        update_server_url(res);
        saveFile(link);
    }).error(function (err) {
        console.log(err);
        alert(err);
    });
}

function get_urls(res) {
    $.ajax({
        url: "http://127.0.0.1:8000/get/",
        method: "GET",
        data: {}
    }).done(function (data) {
        img_lst = eval(data);

        img_lst.map(function (x) {
            update_img_list(x);
        });
        remount_left();
    }).error(function (err) {
        alert(err);

        console.log(err);
    });
}

function update_server_url(res) {
    var result = { 'url': res.data.link };
    result = JSON.stringify(result);
    $.ajax({
        url: "http://127.0.0.1:8000/save/",
        method: "POST",
        data: result
    }).done(function (data) {
        console.log(data);
    }).error(function (err) {
        console.log(err);
        alert(err);
    });
}

get_urls();

if (window.FileReader) {
    var drop;
    addEventHandler(window, 'load', function () {
        var status = document.getElementById('status');
        drop = document.getElementById('drop');
        var list = document.getElementById('list');

        function cancel(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            return false;
        }

        // Tells the browser that we *can* drop on this target
        addEventHandler(drop, 'dragover', cancel);
        addEventHandler(drop, 'dragenter', cancel);

        addEventHandler(drop, 'drop', function (e) {
            e = e || window.event; // get window.event if e argument missing (in IE)
            if (e.preventDefault) {
                e.preventDefault();
            } // stops the browser from redirecting off to the image.

            var dt = e.dataTransfer;
            var files = dt.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();

                //attach event handlers here...

                reader.readAsDataURL(file);
                addEventHandler(reader, 'loadend', function (e, file) {
                    console.log(this.result);
                    var bin = this.result;
                    var newFile = document.createElement('div');
                    newFile.innerHTML = 'Loaded : ' + file.name + ' size ' + file.size + ' B';
                    list.appendChild(newFile);
                    var fileNumber = list.getElementsByTagName('div').length;
                    status.innerHTML = fileNumber < files.length ? 'Loaded 100% of file ' + fileNumber + ' of ' + files.length + '...' : 'Done loading. processed ' + fileNumber + ' files.';

                    var img = document.createElement("img");
                    img.file = file;
                    img.src = bin;
                    list.appendChild(img);
                }.bindToEventHandler(file));
            }
            return false;
        });
        Function.prototype.bindToEventHandler = function bindToEventHandler() {
            var handler = this;
            var boundParameters = Array.prototype.slice.call(arguments);
            //create closure
            return function (e) {
                e = e || window.event; // get window.event if e argument missing (in IE)
                boundParameters.unshift(e);
                handler.apply(this, boundParameters);
            };
        };
    });
} else {
    document.getElementById('status').innerHTML = 'Your browser does not support the HTML5 FileReader.';
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
