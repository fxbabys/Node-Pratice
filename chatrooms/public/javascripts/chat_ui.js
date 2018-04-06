function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
    return $('<div></div>').html('<i>' + message + '</i>');
}

/*处理用户原始输入*/
function processUserInput(chatApp, socket) {
    let message = $('#send-message').val();
    let systemMessage;

    /*用户输入以/开头则作为聊天命令*/
    if (message.charAt(0) == '/') {
        systemMessage = chatApp.processCommand(message);
        if (systemMessage) {
            $('#messages').append(divSystemContentElement(systemMessage));
        }
        console.log("聊天命令");
    } else {
        /*将非命令输入广播给其他用户*/
        chatApp.sendMessage($('#room').text(), message);
        $('#messages').append(divEscapedContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
        console.log("聊天信息");
    }

    $('#send-message').val('');
}

/*客户端程序初始化逻辑*/
let socket = io.connect();

$(document).ready(function() {
    let chatApp = new Chat(socket);

    /*显示更名尝试的结果*/
    socket.on('nameResult', function(result) {
        let message;

        if (result.success) {
            message = 'You are now known as ' + result.name + '.';
        } else {
            message = result.message;
        }
        $('#messages').append(divSystemContentElement(message));
    });

    /*显示房间变更结果*/
    socket.on('joinResult', function(result) {
        $('#room').text(result.room);
        $('#messages').append(divSystemContentElement('Room changed.'));
    });

    /*显示接收到的消息*/
    socket.on('message', function(message) {
        let newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);
    });

    /*显示可用房间列表*/
    socket.on('rooms', function(rooms) {
        $('#room-list').empty();

        for(let room in rooms) {
            room = room.substring(1, room.length);
            if (room != '') {
                $('#room-list').append(divEscapedContentElement(room));
            }
        }

        /*点击房间名可以切换到那个房间中*/
        $('#room-list div').click(function() {
            chatApp.processCommand('/join ' + $(this).text());
            $('#send-message').focus();
        });
    });

    /*定期请求可用房间列表*/
    setInterval(function() {
        socket.emit('rooms');
    }, 1000);

    /*提交表单可以发送聊天信息*/
    $('#send-message').focus();
    $('#send-form').submit(function() {
        processUserInput(chatApp, socket);
        console.log("点击提交");
        return false;
    });
});