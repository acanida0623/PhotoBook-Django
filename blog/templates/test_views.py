<div className="what">
<img src={album_cover} />
<div className="circle1"></div>
<div className="circle2"></div>
<div className="circle3"></div>
<div className="title_cont"><p>{this.props.album_name}</p></div>
</div>






<div class="page-header" id="page-header" >
{% if user.is_authenticated %}

<div class="top-menu">
<input id="search_album" placeholder="Search" />

<div id="back_albums">
<span>
Albums
</span>
</div>

<div id="create_new_album">
<span>
New Album
</p>
</span>
</div>
<div id="upload_new">
<span>
Upload

</span>
</div>

<label class="switch">
<input id="imgur_check" type="checkbox" >
<div class="slider round"></div>
</label>

<span id="hello_user">Hello {{ user.username }}(<a href="{% url 'logout_the_user' %}">Log out</a>)</span>

</div>

{% else %}
<a href="{% url 'blog.views.login_home' %}" class="top-menu"><span class="glyphicon glyphicon-lock"></span></a>
{% endif %}
</div>
