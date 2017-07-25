// Auto-execute an anonymous function to create a separate scope from the rest of the code
(function(){
	// Constructor for the Widget object
	function Widget(options){
		if(options.id.indexOf('#') < 0)
			options.id = '#' + options.id

		// Define Widget properties and create elements
		this.data        = options.data
		this.rev_num     = 0
		this.root        = $('<div class="wg-root"></div>')

		// Company info
		var amount_reviews = options.data.length
		var rating_array   = options.data.map(function(x){ 
												return parseInt(x.starRating)
											})
		var overall_rating = Math.round(rating_array.reduce(function(a, b){ 
																return a + b
															}, 0) / amount_reviews)

		this.company             = $('<div class="wg-company"></div>')
		this.company_rating      = $('<div class="wg-company-rating"></div>')
		this.img_company_rating  = $('<img class="wg-img-company-rating" src="img/' + overall_rating + 
										'-stars.png"></img>')
		this.btn_tp				 = $('<a class="wg-btn-tp" href="https://goo.gl/kMBbXx" target="_blank"></a>')
		this.logo_tp             = $('<img class="wg-logo-tp" src="img/company-logo.png"></img>')
		this.based               = $('<p class="wg-based">Based on <strong>' + amount_reviews + 
										'</strong> reviews.</p>')

		// Background
		this.circle      = $('<div class="wg-circle"></div>')
		this.background  = $('<div class="wg-background"></div>')

		// Review
		this.review_wrap = $('<div class="wg-review-wrap"></div>')
		this.review      = $('<div class="wg-review wg-review-anim"></div>')
		this.name        = $('<p class="wg-name"></p>')
		this.title       = $('<h1 class="wg-title"></h1>')
		this.rating      = $('<div class="wg-rating"></div>')
		this.body        = $('<p class="wg-body wg-mask"></p>')

		// Show first review & company info
		this.name.html(this.data[this.rev_num].firstName)
		this.title.html(this.data[this.rev_num].reviewTitle)
		var img_rating = this.data[this.rev_num].starRating
		this.rating.html('<img class="wg-img" src="img/' + img_rating + '-stars.png"></img>')
		this.body.html(this.data[this.rev_num].reviewBody)
		this.background.addClass('wg-transform')
		
		// Buttons
        this.previousBtnWrap = $('<div class="wg-button-wrap wg-previous"></div>')
        this.nextBtnWrap     = $('<div class="wg-button-wrap wg-next"></div>')
        this.previousBtn = $('<button class="wg-button wg-previous"></button>')
        this.nextBtn     = $('<button class="wg-button wg-next"></button>')

        this.appendElements()
        this.elementBindings()
        $(options.id).append(this.root)
	}

	// Append elements to this.root
	Widget.prototype.appendElements = function(){
		this.company.append(this.img_company_rating)
		this.company.append(this.based)
		this.company.append(this.logo_tp)
		this.company.append(this.btn_tp)
		this.circle.append(this.background)
		this.review.append(this.name)
		this.review.append(this.title)
		this.review.append(this.rating)
		this.review.append(this.body)
		this.review_wrap.append(this.review)
		this.previousBtnWrap.append(this.previousBtn)
		this.nextBtnWrap.append(this.nextBtn)
		this.root.append(this.company)
		this.root.append(this.review_wrap)
		this.root.append(this.circle)
		this.root.append(this.previousBtnWrap)
		this.root.append(this.nextBtnWrap)
	}
	// Create event bindings for the prev & next buttons
	Widget.prototype.elementBindings = function(){
		this.previousBtn.on('click', _.bind(this.animateElement, this, 'right'))
		this.nextBtn.on('click', _.bind(this.animateElement, this, 'left'))
		this.body.on('scroll', _.bind(this.scrollBody, this))
	}

	// Know when review body has been scrolled
	Widget.prototype.scrollBody = function(){
		if(this.body.scrollTop() + this.body.innerHeight() >= this.body[0].scrollHeight - 20)
            this.body.removeClass('wg-mask')
        else
            this.body.addClass('wg-mask')
	}
	// Animate widget elements
	Widget.prototype.animateElement = function(direction){
		$('.wg-button').attr('disabled', true)
		this.background.addClass('wg-transform')
		var angle       = this.getRotationDegrees(this.background)
		var rotation    = (direction === 'right') ? angle - 90 : angle + 90

		if(direction === 'left'){
			this.review.css({top: '-500px',
							opacity: 0})
			this.rev_num++
		} else {
			this.review.css({top: '700px',
							opacity: 0})
			this.rev_num--
		}

		if(this.rev_num < 0)
			this.rev_num = this.data.length-1
		else if(this.rev_num > this.data.length-1)
			this.rev_num = 0

		this.background.css({transform: 'rotate(' + rotation + 'deg)'})

		var rotateZeroDirection = null
		if(rotation <= -260)
			rotateZeroDirection = 'right'
		else if(rotation >= 260)
			rotateZeroDirection = 'left'
		var rotated = false
		if(rotateZeroDirection !== null)
			rotated = true
		
		setTimeout(_.bind(this.animateReview, this, direction, rotated, rotateZeroDirection), 100)
	}

	// Animate reviews exit-change-enter
	Widget.prototype.animateReview = function(dir, rot, rot_dir){
		if(rot === true)
			setTimeout(_.bind(this.rotateToZero, this, rot_dir), 1000)

		this.review.removeClass('wg-review-anim')
		if(dir === 'left')
			this.review.css({top: '700px'})
		else
			this.review.css({top: '-500px'})
		
		var img_rating = this.data[this.rev_num].starRating
		this.name.html(this.data[this.rev_num].firstName)
		this.title.html(this.data[this.rev_num].reviewTitle)
		this.rating.html('<img class="wg-img" src="img/' + img_rating + '-stars.png"></img>')
		this.body.html(this.data[this.rev_num].reviewBody)
		
		setTimeout(_.bind(function(){
			this.review.addClass('wg-review-anim')
			this.review.css({top: '0px', opacity: 1})
			setTimeout(function(){$('.wg-button').attr('disabled', false)}, 1000)
		}, this), 20)
	}

	// Change rotation while class is removed to 0 to avoid animation
	Widget.prototype.rotateToZero = function(dir) {
		if(dir === 'right'){
			this.background.removeClass('wg-transform')
			this.background.css({transform: 'rotate(90deg)'})
		} else {
			this.background.removeClass('wg-transform')
			this.background.css({transform: 'rotate(-90deg)'})
		}
	}

	// Get rotation degrees to animate background
	Widget.prototype.getRotationDegrees = function(obj) {
	    var matrix = obj.css("-webkit-transform") ||
	    obj.css("-moz-transform")    ||
	    obj.css("-ms-transform")     ||
	    obj.css("-o-transform")      ||
	    obj.css("transform")
	    if(matrix !== 'none') {
	        var values = matrix.split('(')[1].split(')')[0].split(',')
	        var a = values[0]
	        var b = values[1]
	        var angle = Math.round(Math.atan2(b, a) * (180/Math.PI))
	    } else { var angle = 0 }
	    return angle
	}

	window.Widgett = Widget

})()