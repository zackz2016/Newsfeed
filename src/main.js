// 导入MVC组件
import { FeedModel } from './models/FeedModel.js';
import { FeedView } from './views/FeedView.js';
import { FeedController } from './controllers/FeedController.js';

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new FeedController(
        new FeedModel(),
        new FeedView()
    );
}); 