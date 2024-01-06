
bd.helper.registerComponent(class Icon extends React.Component {
    constructor(props) {
        super(props);

        this.defaultIcons = {
            'bd-logo': 'M 4 3 A 1 1 0 0 0 3 4 L 3 10 A 1 1 0 0 0 4 11 L 10 11 A 1 1 0 0 0 11 10 L 11 4 A 1 1 0 0 0 10 3 Z M 4 13 A 1 1 0 0 0 3 14 L 3 20 A 1 1 0 0 0 4 21 L 10 21 A 1 1 0 0 0 11 20 L 11 14 A 1 1 0 0 0 10 13 Z M 14 3 A 1 1 0 0 0 13 4 L 13 20 A 1 1 0 0 0 14 21 L 20 21 A 1 1 0 0 0 21 20 L 21 4 A 1 1 0 0 0 20 3 Z',

            'wp-alignfull': 'M5 4v11h14V4H5zm3 15.8h8v-1.5H8v1.5z',
            'wp-alignwide': 'M5 9v6h14V9H5zm11-4.8H8v1.5h8V4.2zM8 19.8h8v-1.5H8v1.5z',
            'wp-aligncontent': 'M5 15h14V9H5v6zm0 4.8h14v-1.5H5v1.5zM5 4.2v1.5h14V4.2H5z',
            
            'help-box': 'M11,18H13V16H11V18M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3Z',
            'chevron-right': 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z',
            'close': 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
            'plus': 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z',
            'code-tags': 'M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z',
            'checkerboard': 'M2 2V22H22V2H2M20 12H16V16H20V20H16V16H12V20H8V16H4V12H8V8H4V4H8V8H12V4H16V8H20V12M16 8V12H12V8H16M12 12V16H8V12H12Z',
            'border-radius': 'M3 16C3 18.8 5.2 21 8 21H10V19H8C6.3 19 5 17.7 5 16V14H3V16M21 8C21 5.2 18.8 3 16 3H14V5H16C17.7 5 19 6.3 19 8V10H21V8M16 21C18.8 21 21 18.8 21 16V14H19V16C19 17.7 17.7 19 16 19H14V21H16M8 3C5.2 3 3 5.2 3 8V10H5V8C5 6.3 6.3 5 8 5H10V3H8Z',
            'arrow-expand-horizontal': 'M9,11H15V8L19,12L15,16V13H9V16L5,12L9,8V11M2,20V4H4V20H2M20,20V4H22V20H20Z',
            'border-all': 'M19,11H13V5H19M19,19H13V13H19M11,11H5V5H11M11,19H5V13H11M3,21H21V3H3V21Z',
            'arrow-left-right-bold': 'M8,14V18L2,12L8,6V10H16V6L22,12L16,18V14H8Z',
            'table-column': 'M8,2H16A2,2 0 0,1 18,4V20A2,2 0 0,1 16,22H8A2,2 0 0,1 6,20V4A2,2 0 0,1 8,2M8,10V14H16V10H8M8,16V20H16V16H8M8,4V8H16V4H8Z',
            'table-row': 'M22,14A2,2 0 0,1 20,16H4A2,2 0 0,1 2,14V10A2,2 0 0,1 4,8H20A2,2 0 0,1 22,10V14M4,14H8V10H4V14M10,14H14V10H10V14M16,14H20V10H16V14Z',
            'link': 'M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z',
            'link-off': 'M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.43 19.12,14.63 17.79,15L19.25,16.44C20.88,15.61 22,13.95 22,12A5,5 0 0,0 17,7M16,11H13.81L15.81,13H16V11M2,4.27L5.11,7.38C3.29,8.12 2,9.91 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12C3.9,10.41 5.11,9.1 6.66,8.93L8.73,11H8V13H10.73L13,15.27V17H14.73L18.74,21L20,19.74L3.27,3L2,4.27Z',
            'close-circle': 'M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z',
            'file-tree': 'M3,3H9V7H3V3M15,10H21V14H15V10M15,17H21V21H15V17M13,13H7V18H13V20H7L5,20V9H7V11H13V13Z',
            'format-text': 'M18.5,4L19.66,8.35L18.7,8.61C18.25,7.74 17.79,6.87 17.26,6.43C16.73,6 16.11,6 15.5,6H13V16.5C13,17 13,17.5 13.33,17.75C13.67,18 14.33,18 15,18V19H9V18C9.67,18 10.33,18 10.67,17.75C11,17.5 11,17 11,16.5V6H8.5C7.89,6 7.27,6 6.74,6.43C6.21,6.87 5.75,7.74 5.3,8.61L4.34,8.35L5.5,4H18.5Z',
            'dock-bottom': 'M20 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V6A2 2 0 0 0 20 4M20 13H4V6H20Z',
            'dots-grid': 'M12 16C13.1 16 14 16.9 14 18S13.1 20 12 20 10 19.1 10 18 10.9 16 12 16M12 10C13.1 10 14 10.9 14 12S13.1 14 12 14 10 13.1 10 12 10.9 10 12 10M12 4C13.1 4 14 4.9 14 6S13.1 8 12 8 10 7.1 10 6 10.9 4 12 4M6 16C7.1 16 8 16.9 8 18S7.1 20 6 20 4 19.1 4 18 4.9 16 6 16M6 10C7.1 10 8 10.9 8 12S7.1 14 6 14 4 13.1 4 12 4.9 10 6 10M6 4C7.1 4 8 4.9 8 6S7.1 8 6 8 4 7.1 4 6 4.9 4 6 4M18 16C19.1 16 20 16.9 20 18S19.1 20 18 20 16 19.1 16 18 16.9 16 18 16M18 10C19.1 10 20 10.9 20 12S19.1 14 18 14 16 13.1 16 12 16.9 10 18 10M18 4C19.1 4 20 4.9 20 6S19.1 8 18 8 16 7.1 16 6 16.9 4 18 4Z',
            'image': 'M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z',
            'alert': 'M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z',
            'information': 'M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z',
            'alert-octagon': 'M13 13H11V7H13M11 15H13V17H11M15.73 3H8.27L3 8.27V15.73L8.27 21H15.73L21 15.73V8.27L15.73 3Z',
            'check-circle': 'M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z',
            'format-letter-case': 'M20.06,18C20,17.83 19.91,17.54 19.86,17.11C19.19,17.81 18.38,18.16 17.45,18.16C16.62,18.16 15.93,17.92 15.4,17.45C14.87,17 14.6,16.39 14.6,15.66C14.6,14.78 14.93,14.1 15.6,13.61C16.27,13.12 17.21,12.88 18.43,12.88H19.83V12.24C19.83,11.75 19.68,11.36 19.38,11.07C19.08,10.78 18.63,10.64 18.05,10.64C17.53,10.64 17.1,10.76 16.75,11C16.4,11.25 16.23,11.54 16.23,11.89H14.77C14.77,11.46 14.92,11.05 15.22,10.65C15.5,10.25 15.93,9.94 16.44,9.71C16.95,9.5 17.5,9.36 18.13,9.36C19.11,9.36 19.87,9.6 20.42,10.09C20.97,10.58 21.26,11.25 21.28,12.11V16C21.28,16.8 21.38,17.42 21.58,17.88V18H20.06M17.66,16.88C18.11,16.88 18.54,16.77 18.95,16.56C19.35,16.35 19.65,16.07 19.83,15.73V14.16H18.7C16.93,14.16 16.04,14.63 16.04,15.57C16.04,16 16.19,16.3 16.5,16.53C16.8,16.76 17.18,16.88 17.66,16.88M5.46,13.71H9.53L7.5,8.29L5.46,13.71M6.64,6H8.36L13.07,18H11.14L10.17,15.43H4.82L3.86,18H1.93L6.64,6Z',
            'format-align-left': 'M3,3H21V5H3V3M3,7H15V9H3V7M3,11H21V13H3V11M3,15H15V17H3V15M3,19H21V21H3V19Z',
            'format-align-center': 'M3,3H21V5H3V3M7,7H17V9H7V7M3,11H21V13H3V11M7,15H17V17H7V15M3,19H21V21H3V19Z',
            'format-align-right': 'M3,3H21V5H3V3M9,7H21V9H9V7M3,11H21V13H3V11M9,15H21V17H9V15M3,19H21V21H3V19Z',
            'format-align-justify': 'M3,3H21V5H3V3M3,7H21V9H3V7M3,11H21V13H3V11M3,15H21V17H3V15M3,19H21V21H3V19Z',
            'format-underline': 'M5,21H19V19H5V21M12,17A6,6 0 0,0 18,11V3H15.5V11A3.5,3.5 0 0,1 12,14.5A3.5,3.5 0 0,1 8.5,11V3H6V11A6,6 0 0,0 12,17Z',
            'format-overline': 'M5,5H19V3H5V5M9.62,16L12,9.67L14.37,16M11,7L5.5,21H7.75L8.87,18H15.12L16.25,21H18.5L13,7H11Z',
            'format-strikethrough': 'M3,14H21V12H3M5,4V7H10V10H14V7H19V4M10,19H14V16H10V19Z',
            'checkbox-blank-outline': 'M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z',
            'arrow-collapse-horizontal': 'M13,20V4H15.03V20H13M10,20V4H12.03V20H10M5,8L9.03,12L5,16V13H2V11H5V8M20,16L16,12L20,8V11H23V13H20V16Z',
            'arrow-collapse-vertical': 'M4,12H20V14H4V12M4,9H20V11H4V9M16,4L12,8L8,4H11V1H13V4H16M8,19L12,15L16,19H13V22H11V19H8Z',
            'arrow-expand-horizontal': 'M9,11H15V8L19,12L15,16V13H9V16L5,12L9,8V11M2,20V4H4V20H2M20,20V4H22V20H20Z',
            'arrow-expand-vertical': 'M13,9V15H16L12,19L8,15H11V9H8L12,5L16,9H13M4,2H20V4H4V2M4,20H20V22H4V20Z',
            'plus-box': 'M17,13H13V17H11V13H7V11H11V7H13V11H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z',
            'circle-medium': 'M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z',
            'auto-fix': 'M7.5,5.6L5,7L6.4,4.5L5,2L7.5,3.4L10,2L8.6,4.5L10,7L7.5,5.6M19.5,15.4L22,14L20.6,16.5L22,19L19.5,17.6L17,19L18.4,16.5L17,14L19.5,15.4M22,2L20.6,4.5L22,7L19.5,5.6L17,7L18.4,4.5L17,2L19.5,3.4L22,2M13.34,12.78L15.78,10.34L13.66,8.22L11.22,10.66L13.34,12.78M14.37,7.29L16.71,9.63C17.1,10 17.1,10.65 16.71,11.04L5.04,22.71C4.65,23.1 4,23.1 3.63,22.71L1.29,20.37C0.9,20 0.9,19.35 1.29,18.96L12.96,7.29C13.35,6.9 14,6.9 14.37,7.29Z',
            'monitor-star': 'M21,16V4H3V16H21M21,2A2,2 0 0,1 23,4V16A2,2 0 0,1 21,18H14V20H16V22H8V20H10V18H3C1.89,18 1,17.1 1,16V4C1,2.89 1.89,2 3,2H21M12.97,9H16L13.53,10.76L14.47,13.67L12,11.87L9.53,13.67L10.47,10.76L8,9H11.03L12,6L12.97,9Z',
            'tablet': 'M19,18H5V6H19M21,4H3C1.89,4 1,4.89 1,6V18A2,2 0 0,0 3,20H21A2,2 0 0,0 23,18V6C23,4.89 22.1,4 21,4Z',
            'cellphone': 'M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z',
            'link-variant': 'M10.59,13.41C11,13.8 11,14.44 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C7.22,12.88 7.22,9.71 9.17,7.76V7.76L12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.3,11.96 18.17,11.14 17.89,10.36L18.36,9.88C19.54,8.71 19.54,6.81 18.36,5.64C17.19,4.46 15.29,4.46 14.12,5.64L10.59,9.17C9.41,10.34 9.41,12.24 10.59,13.41M13.41,9.17C13.8,8.78 14.44,8.78 14.83,9.17C16.78,11.12 16.78,14.29 14.83,16.24V16.24L11.29,19.78C9.34,21.73 6.17,21.73 4.22,19.78C2.27,17.83 2.27,14.66 4.22,12.71L5.71,11.22C5.7,12.04 5.83,12.86 6.11,13.65L5.64,14.12C4.46,15.29 4.46,17.19 5.64,18.36C6.81,19.54 8.71,19.54 9.88,18.36L13.41,14.83C14.59,13.66 14.59,11.76 13.41,10.59C13,10.2 13,9.56 13.41,9.17Z',
        };
    }

    getDefaultSvg(path, options) {
        const {viewBox} = options || {};
        const {icon, style, color, size, ...attr} = this.props;
        return React.createElement('svg',
            {
                'aria-hidden': 'true',
                style: Object.assign({ verticalAlign: 'middle' }, this.props.style || {}),
                width: this.props.size || 24,
                height: this.props.size || 24,
                viewBox: viewBox || '0 0 24 24',
                ...attr,
            }, React.createElement('path',
                {
                    fill: this.props.color ? this.props.color : 'currentColor',
                    d: path
                }
            )
        )
    }

    getAlignItemsSvg(type, direction) {
        const column = !!direction.match(/^column/);
        const reverse = !!direction.match(/\-reverse$/);

        let line1y;
        let line2exist;
        let elem2exist = this.props.elem2exist !== false;
        let elem1y;
        let elem1h;
        let elem1v = elem2exist ? 5 : 6;
        switch (type) {
            case 'flex-start': line1y = 0;  line2exist = false; elem1y = 3;                   elem1h = elem2exist ? 10 : 14; break;
            case 'center':     line1y = 11; line2exist = false; elem1y = elem2exist ? 7 : 5;  elem1h = elem2exist ? 10 : 14; break;
            case 'flex-end':   line1y = 22; line2exist = false; elem1y = elem2exist ? 11 : 7; elem1h = elem2exist ? 10 : 14; break;
            case 'stretch':    line1y = 0;  line2exist = true;  elem1y = 3;                   elem1h = 18;                   break;
        }
        let elem1x = reverse ? 13 : (elem2exist ? 6 : 9);
        let elem2x = reverse ? 6 : 13;

        const v = column ? 'h' : 'v';
        const h = column ? 'v' : 'h';
        function M(x, y) { return 'M ' + (column ? y + ' ' + x : x + ' ' + y); }

        const line1 = `${M(0, line1y)} ${h} 24 ${v} 2 ${h} -24 z`;
        const line2 = line2exist ? `${M(0, 22)} ${h} 24 ${v} 2 ${h} -24 z` : '';
        const elem1 = `${M(elem1x, elem1y)} ${h} ${elem1v} ${v} ${elem1h} ${h} -${elem1v} z`;
        const elem2 = elem2exist ? `${M(elem2x, 3)} ${h} 5 ${v} 18 ${h} -5 z` : '';

        return React.createElement('svg',
            {
                'aria-hidden': 'true',
                style: Object.assign({ verticalAlign: 'middle' }, this.props.style || {}),
                width: 24,
                height: 24,
                viewBox: '0 0 24 24'
            }, React.createElement('path',
                {
                    fill: this.props.color ? this.props.color : 'currentColor',
                    'fill-rule': 'nonzero',
                    d: [line1, line2, elem1, elem2].join(' ')
                }
            )
        )
    }

    getJustifyContentSvg(type, direction) {
        const column = !!direction.match(/^column/);
        const reverse = !!direction.match(/\-reverse$/);

        let line1x;
        let line2exist;
        let elem1x;
        let elem2x;
        switch (type) {
            case 'flex-start':    line1x = 0;  line2exist = false; elem1x = 3;  elem2x = 9;  break;
            case 'center':        line1x = 11; line2exist = false; elem1x = 5;  elem2x = 14; break;
            case 'flex-end':      line1x = 22; line2exist = false; elem1x = 16; elem2x = 10; break;
            case 'space-between': line1x = 0;  line2exist = true;  elem1x = 3;  elem2x = 16; break;
            case 'space-around':  line1x = 0;  line2exist = true;  elem1x = 5;  elem2x = 14; break;
        }
        if (reverse && ['flex-start', 'flex-end'].indexOf(type) > -1) {
            line1x = 24 - line1x - 2;
            elem1x = 24 - elem1x - 5;
            elem2x = 24 - elem2x - 5;
        }

        const v = column ? 'h' : 'v';
        const h = column ? 'v' : 'h';
        function M(x, y) { return 'M ' + (column ? y + ' ' + x : x + ' ' + y); }

        const line1 = `${M(line1x, 0)} ${h} 2 ${v} 24 ${h} -2 z`;
        const line2 = line2exist ? `${M(22, 0)} ${h} 2 ${v} 24 ${h} -2 z` : '';
        const elem1 = `${M(elem1x, 4)} ${h} 5 ${v} 16 ${h} -5 z`;
        const elem2 = `${M(elem2x, 4)} ${h} 5 ${v} 16 ${h} -5 z`;

        return React.createElement('svg',
            {
                'aria-hidden': 'true',
                style: Object.assign({ verticalAlign: 'middle' }, this.props.style || {}),
                width: 24,
                height: 24,
                viewBox: '0 0 24 24'
            }, React.createElement('path',
                {
                    fill: this.props.color ? this.props.color : 'currentColor',
                    'fill-rule': 'nonzero',
                    d: [line1, line2, elem1, elem2].join(' ')
                }
            )
        )
    }

    render() {
        const data = window.BDData || window.BDEditorData;
        if (this.props.icon in this.defaultIcons) {
            return this.getDefaultSvg(this.defaultIcons[this.props.icon]);
        }
        if (this.props.icon.indexOf('dashicons-') === 0 && typeof data.dashicons[this.props.icon.substr('dashicons-'.length)] !== undefined) {
            return this.getDefaultSvg(data.dashicons[this.props.icon.substr('dashicons-'.length)], {viewBox: '-2 -2 24 24'});
        }
        switch (this.props.icon) {

            case 'bd-alignItems': return this.getAlignItemsSvg(this.props.type, this.props.dir);
            case 'bd-justifyContent': return this.getJustifyContentSvg(this.props.type, this.props.dir);
            
            //case 'help-box':
            default: return this.getDefaultSvg(this.defaultIcons['help-box']);
        }
    }
});
